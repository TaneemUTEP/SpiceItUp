import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

type NavProp = StackNavigationProp<RootStackParamList>;

const DareDiceSetup: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [players, setPlayers] = useState<string[]>(['Player 1', 'Player 2']);
  const [mode, setMode] = useState<'normal' | 'rounds'>('normal');
  const [rounds, setRounds] = useState<number>(3);

  const updatePlayer = (i: number, text: string) => {
    setPlayers(current => current.map((value, idx) => (idx === i ? text : value)));
  };

  const addPlayer = () => {
    if (players.length >= 3) return;
    setPlayers(current => [...current, `Player ${current.length + 1}`]);
  };

  const removePlayer = (i: number) => {
    if (players.length <= 2) return;
    setPlayers(current => current.filter((_, idx) => idx !== i));
  };

  const start = () => {
    const names = players.map(name => name.trim()).filter(Boolean);
    const uniqueNames = new Set(names);

    if (names.length < 2 || uniqueNames.size < names.length) {
      Alert.alert('Invalid players', 'Please provide at least 2 unique player names.');
      return;
    }

    if (mode === 'normal') {
      navigation.navigate('DareDiceNormal', { players: names });
      return;
    }

    navigation.navigate('DareDiceRounds', { players: names, rounds });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Game Setup</Text>
      <Text style={styles.title}>Dare Dice</Text>
      <Text style={styles.subtitle}>Set the table, name the players, and choose how long the game should last.</Text>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Players</Text>
        <Text style={styles.panelHint}>Minimum 2, maximum 3</Text>

        {players.map((player, index) => (
          <View key={index} style={styles.playerRow}>
            <Text style={styles.playerIndex}>{index + 1}</Text>
            <TextInput
              style={styles.input}
              value={player}
              placeholder={`Player ${index + 1}`}
              placeholderTextColor="#c9958a"
              onChangeText={text => updatePlayer(index, text)}
            />
            <Pressable style={[styles.smallButton, players.length <= 2 && styles.smallButtonDisabled]} onPress={() => removePlayer(index)} disabled={players.length <= 2}>
              <Text style={styles.smallButtonText}>Remove</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={[styles.addButton, players.length >= 3 && styles.smallButtonDisabled]} onPress={addPlayer} disabled={players.length >= 3}>
          <Text style={styles.addButtonText}>Add Player</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Mode</Text>
        <View style={styles.modeRow}>
          <Pressable style={[styles.modeChip, mode === 'normal' && styles.modeChipActive]} onPress={() => setMode('normal')}>
            <Text style={[styles.modeChipText, mode === 'normal' && styles.modeChipTextActive]}>Normal</Text>
          </Pressable>
          <Pressable style={[styles.modeChip, mode === 'rounds' && styles.modeChipActive]} onPress={() => setMode('rounds')}>
            <Text style={[styles.modeChipText, mode === 'rounds' && styles.modeChipTextActive]}>Rounds</Text>
          </Pressable>
        </View>

        {mode === 'rounds' ? (
          <View style={styles.roundsRow}>
            <Text style={styles.roundsLabel}>Rounds</Text>
            <TextInput
              style={styles.roundsInput}
              value={String(rounds)}
              keyboardType="numeric"
              placeholderTextColor="#c9958a"
              onChangeText={text => setRounds(Math.max(1, parseInt(text || '0', 10) || 1))}
            />
          </View>
        ) : null}
      </View>

      <Pressable style={styles.startButton} onPress={start}>
        <Text style={styles.startButtonText}>Start Dare Dice</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#260708',
  },
  kicker: {
    color: '#ffb28f',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 6,
  },
  title: {
    color: '#fff4ee',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#f2c7b5',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  panel: {
    backgroundColor: '#4b1217',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#7f2d32',
    marginBottom: 16,
  },
  panelTitle: {
    color: '#fff3ed',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  panelHint: {
    color: '#dfb0a3',
    fontSize: 13,
    marginBottom: 14,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerIndex: {
    width: 26,
    color: '#ffcfb9',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff0e7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#5b1717',
    borderWidth: 1,
    borderColor: '#ffbe9d',
    marginRight: 10,
  },
  smallButton: {
    backgroundColor: '#7a1e25',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  smallButtonDisabled: {
    opacity: 0.45,
  },
  smallButtonText: {
    color: '#fff2ec',
    fontWeight: '700',
  },
  addButton: {
    marginTop: 4,
    backgroundColor: '#f05a28',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fffaf5',
    fontSize: 16,
    fontWeight: '800',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8d4145',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#64181f',
  },
  modeChipActive: {
    backgroundColor: '#f05a28',
    borderColor: '#ff915f',
  },
  modeChipText: {
    color: '#ffd9ca',
    fontWeight: '700',
  },
  modeChipTextActive: {
    color: '#fff7f2',
  },
  roundsRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundsLabel: {
    color: '#ffd9ca',
    fontSize: 16,
    fontWeight: '600',
  },
  roundsInput: {
    width: 86,
    backgroundColor: '#fff0e7',
    borderRadius: 14,
    paddingVertical: 10,
    textAlign: 'center',
    color: '#5b1717',
    borderWidth: 1,
    borderColor: '#ffbe9d',
    fontWeight: '700',
  },
  startButton: {
    marginTop: 8,
    backgroundColor: '#b61f1f',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff8a59',
  },
  startButtonText: {
    color: '#fff7f2',
    fontSize: 17,
    fontWeight: '800',
  },
});

export default DareDiceSetup;
