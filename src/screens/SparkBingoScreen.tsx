import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView, useWindowDimensions } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<RootStackParamList, 'SparkBingo'>;

const boardLetters = ['B', 'I', 'N', 'G', 'O'];
const pool = [
  'Kiss for 30s',
  'Remove one item',
  'Blindfold for 1 min',
  'Give a 2-min massage',
  'Whisper a fantasy',
  'Feed a strawberry',
  'Nibble earlobe',
  'Slow dance',
  'Try a new position',
  'Compliment body',
  'Trace with ice',
  'Foot massage',
  'Playful tickle',
  'Soft biting',
  'Neck kiss',
  'Use feather',
  'Make out for 1 min',
  'Give a lap dance',
  'Light spanking',
  'Trade a secret',
  'Send a sexy photo',
  'Roleplay 2 min',
  'Explore a new spot',
  'Slow caress',
  'Share a fantasy',
  'Deep kiss',
  'Hug tightly',
  'Play with hair',
  'Blind guess (touch)',
];

function shuffle<T>(arr: T[]) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const makeCard = () => {
  const items = shuffle(pool).slice(0, 25);
  items[12] = 'FREE';
  return items.map(label => ({ label, marked: label === 'FREE' }));
};

const SparkBingoScreen: React.FC<Props> = ({ navigation }) => {
  const [card, setCard] = useState(() => makeCard());
  const [autoActionIndex, setAutoActionIndex] = useState<number | null>(null);
  const [autoActionLabel, setAutoActionLabel] = useState<string>('');
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth * 0.95, 520);

  const checkBingo = useCallback((c = card) => {
    for (let r = 0; r < 5; r += 1) {
      let ok = true;
      for (let col = 0; col < 5; col += 1) {
        if (!c[r * 5 + col].marked) {
          ok = false;
          break;
        }
      }
      if (ok) return true;
    }

    for (let col = 0; col < 5; col += 1) {
      let ok = true;
      for (let r = 0; r < 5; r += 1) {
        if (!c[r * 5 + col].marked) {
          ok = false;
          break;
        }
      }
      if (ok) return true;
    }

    let ok = true;
    for (let i = 0; i < 5; i += 1) {
      if (!c[i * 6].marked) ok = false;
    }
    if (ok) return true;

    ok = true;
    for (let i = 1; i <= 5; i += 1) {
      if (!c[i * 4].marked) ok = false;
    }
    return ok;
  }, [card]);

  const handlePress = (index: number) => {
    setCard(current => {
      const next = current.slice();
      next[index] = { ...next[index], marked: !next[index].marked };

      if (checkBingo(next)) Alert.alert('Bingo!', 'You completed a line!');
      if (next.every(cell => cell.marked)) Alert.alert('Bingo!', 'All tiles filled!');

      return next;
    });
  };

  const reset = () => {
    setCard(makeCard());
    setAutoActionIndex(null);
    setAutoActionLabel('');
  };

  const generateAction = useCallback(() => {
    setCard(current => {
      const unmarkedIndexes = current
        .map((cell, idx) => ({ cell, idx }))
        .filter(item => !item.cell.marked)
        .map(item => item.idx);

      if (unmarkedIndexes.length === 0) {
        Alert.alert('Bingo!', 'All tiles filled!');
        return current;
      }

      const randomIndex = unmarkedIndexes[Math.floor(Math.random() * unmarkedIndexes.length)];
      const next = current.slice();
      const selected = next[randomIndex];
      next[randomIndex] = { ...selected, marked: true };
      setAutoActionIndex(randomIndex);
      setAutoActionLabel(selected.label);

      if (checkBingo(next)) Alert.alert('Bingo!', 'You completed a line!');
      if (next.every(cell => cell.marked)) Alert.alert('Bingo!', 'All tiles filled!');

      return next;
    });
  }, [checkBingo]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.actionRow, { width: contentWidth }]}>
        <View style={styles.actionCopy}>
          <Text style={styles.randomActionLabel}>Random action</Text>
          <Text style={styles.randomActionText}>
            {autoActionLabel || 'Use Generate beside this panel to highlight a tile.'}
          </Text>
        </View>
        <Pressable onPress={generateAction} style={styles.actionButton} hitSlop={8}>
          <Text style={styles.actionButtonText}>Generate</Text>
        </Pressable>
      </View>

      <View style={[styles.boardShell, { width: contentWidth }]}>
        <View style={styles.boardHeader}>
          {boardLetters.map(letter => (
            <View key={letter} style={styles.headerChip}>
              <Text style={styles.headerChipText}>{letter}</Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {Array.from({ length: 5 }, (_, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.gridRow}>
              {card.slice(rowIndex * 5, rowIndex * 5 + 5).map((cell, colIndex) => {
                const cellIndex = rowIndex * 5 + colIndex;
                return (
              <Pressable
                key={`cell-${cellIndex}`}
                onPress={() => handlePress(cellIndex)}
                style={({ pressed }) => [
                  styles.cell,
                  autoActionIndex === cellIndex ? styles.cellAutoHighlight : null,
                  cell.marked ? styles.cellMarked : null,
                  pressed ? styles.cellPressed : null,
                ]}
              >
                    <Text
                      style={[
                        styles.cellText,
                        cell.marked ? styles.cellTextMarked : null,
                        cell.label === 'FREE' ? styles.freeText : null,
                      ]}
                    >
                      {cell.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.controls, { width: contentWidth }]}>
        <Pressable style={styles.primaryButton} onPress={reset}>
          <Text style={styles.primaryButtonText}>Deal New Card</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.secondaryButtonText}>Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1f0405',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 80,
  },
  actionRow: {
    width: '100%',
    backgroundColor: '#2d0608',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#7d1f23',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCopy: {
    alignItems: 'flex-start',
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#f05a28',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#ffd0aa',
  },
  actionButtonText: {
    color: '#fffdfb',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  randomActionLabel: {
    fontSize: 12,
    color: '#f2b8aa',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  randomActionText: {
    fontSize: 16,
    color: '#fff4ec',
    fontWeight: '700',
  },
  boardShell: {
    width: '100%',
    backgroundColor: '#451015',
    borderRadius: 28,
    padding: 12,
    borderWidth: 1,
    borderColor: '#8c3732',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerChip: {
    flexBasis: '18%',
    maxWidth: '18%',
    backgroundColor: '#f05a28',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  headerChipText: {
    color: '#fffaf7',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  grid: { width: '100%' },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cell: {
    flexBasis: '18%',
    maxWidth: '18%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9f3a2d',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
    backgroundColor: '#5b1419',
  },
  cellAutoHighlight: {
    borderColor: '#ffd066',
    shadowColor: '#f7d87a',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  cellPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  cellMarked: {
    backgroundColor: '#f05a28',
    borderColor: '#ffd0aa',
    shadowColor: '#ff8e5c',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  cellText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#fff3ec',
    lineHeight: 16,
  },
  cellTextMarked: {
    fontWeight: '800',
    color: '#fffdfb',
  },
  freeText: {
    fontSize: 13,
    letterSpacing: 0.8,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#c1271f',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ffb16f',
    marginHorizontal: 6,
  },
  primaryButtonText: {
    color: '#fff9f5',
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#5c1418',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#a43f2f',
    marginHorizontal: 6,
  },
  secondaryButtonText: {
    color: '#fff3ec',
    fontWeight: '700',
  },
});

export default SparkBingoScreen;
