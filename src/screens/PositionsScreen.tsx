import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform, ScrollView, useWindowDimensions, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type Props = StackScreenProps<RootStackParamList, 'Positions'>;

const positions = [
  { name: 'Missionary', desc: 'Face-to-face classic position.', imageUri: 'https://via.placeholder.com/400x400.png?text=Missionary' },
  { name: 'Cowgirl', desc: 'Partner on top, facing you.', imageUri: 'https://via.placeholder.com/400x400.png?text=Cowgirl' },
  { name: 'Reverse Cowgirl', desc: 'Partner on top, facing away.', imageUri: 'https://via.placeholder.com/400x400.png?text=Reverse+Cowgirl' },
  { name: 'Doggy Style', desc: 'From behind, hands/knees.', imageUri: 'https://via.placeholder.com/400x400.png?text=Doggy+Style' },
  { name: 'Spooning', desc: 'Side-by-side close contact.', imageUri: 'https://via.placeholder.com/400x400.png?text=Spooning' },
  { name: 'Standing', desc: 'Standing embrace; requires balance.', imageUri: 'https://via.placeholder.com/400x400.png?text=Standing' },
  { name: 'Lotus', desc: 'Sit face-to-face with legs crossed.', imageUri: 'https://via.placeholder.com/400x400.png?text=Lotus' },
  { name: 'Butterfly', desc: 'Partner on edge; you enter while sitting.', imageUri: 'https://via.placeholder.com/400x400.png?text=Butterfly' },
  { name: 'Chair', desc: 'One sits; the other straddles.', imageUri: 'https://via.placeholder.com/400x400.png?text=Chair' },
];

function shuffle<T>(arr: T[]) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const PositionsScreen: React.FC<Props> = ({ navigation }) => {
  const [deck, setDeck] = useState(() => shuffle(positions).slice(0, 6));
  const [revealed, setRevealed] = useState<boolean[]>(() => deck.map(() => false));
  const animsRef = useRef<Animated.Value[]>(deck.map(() => new Animated.Value(0)));
  const useNative = Platform.OS !== 'web';
  const { width } = useWindowDimensions();

  const flipCard = (index: number) => {
    if (revealed[index]) return;

    Animated.timing(animsRef.current[index], {
      toValue: 180,
      duration: 500 + Math.random() * 400,
      useNativeDriver: useNative,
    }).start(() => {
      setRevealed(current => {
        const next = current.slice();
        next[index] = true;
        return next;
      });
    });
  };

  const reset = () => {
    const newDeck = shuffle(positions).slice(0, 6);
    setDeck(newDeck);
    setRevealed(newDeck.map(() => false));
    animsRef.current = newDeck.map(() => new Animated.Value(0));
  };

  const frontStyle = (index: number) => ({
    transform: [
      {
        rotateY: animsRef.current[index].interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  });

  const backStyle = (index: number) => ({
    transform: [
      {
        rotateY: animsRef.current[index].interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  });

  let cardSize = Math.min(220, Math.floor(width * 0.46));
  if (width < 380) {
    cardSize = Math.floor(width * 0.9);
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 40 }]}>
      <Text style={styles.kicker}>Reveal Deck</Text>
      <Text style={styles.title}>Positions Simulator</Text>
      <Text style={styles.subtitle}>Flip through the stack and pull something bolder than the last round.</Text>

      <View style={styles.row}>
        {deck.map((position, index) => (
          <Pressable key={index} onPress={() => flipCard(index)} style={[styles.cardWrap, { width: cardSize, height: cardSize }]}>
            <Animated.View style={[styles.card, styles.cardFront, frontStyle(index)]}>
              {!revealed[index] ? <Text style={styles.cardQuestion}>?</Text> : null}
            </Animated.View>

            <Animated.View style={[styles.card, styles.cardBack, backStyle(index)]} pointerEvents="none">
              {revealed[index] ? (
                <View style={styles.cardContent}>
                  <Image source={{ uri: position.imageUri }} style={styles.cardImage} />
                  <Text style={styles.cardTitle}>{position.name}</Text>
                  <Text style={styles.cardDesc}>{position.desc}</Text>
                </View>
              ) : null}
            </Animated.View>
          </Pressable>
        ))}
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.primaryButton} onPress={reset}>
          <Text style={styles.primaryButtonText}>Shuffle New Deck</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', backgroundColor: '#1f0405', flexGrow: 1 },
  kicker: {
    color: '#ff9b67',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 6,
  },
  title: { fontSize: 28, marginBottom: 8, color: '#fff6f0', fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#ffcfbb', marginBottom: 12, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  cardWrap: { width: '45%', aspectRatio: 1, margin: 12, minWidth: 140 },
  card: {
    flex: 1,
    borderRadius: 10,
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardFront: { backgroundColor: '#5b1419', borderWidth: 1, borderColor: '#9f3a2d' },
  cardBack: { backgroundColor: '#fff0e7', borderWidth: 1, borderColor: '#ffbf8b' },
  cardQuestion: { fontSize: 36, color: '#ffb27e', fontWeight: '800' },
  cardContent: { padding: 10, alignItems: 'center' },
  cardImage: { width: 120, height: 120, borderRadius: 8, marginBottom: 8, resizeMode: 'cover' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#581918' },
  cardDesc: { fontSize: 13, textAlign: 'center', marginTop: 6, color: '#7a3834' },
  controls: { flexDirection: 'row', marginTop: 20, gap: 12 },
  primaryButton: {
    backgroundColor: '#c1271f',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ffb16f',
  },
  primaryButtonText: { color: '#fff9f5', fontWeight: '800' },
  secondaryButton: {
    backgroundColor: '#5c1418',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#a43f2f',
  },
  secondaryButtonText: { color: '#fff3ec', fontWeight: '700' },
});

export default PositionsScreen;
