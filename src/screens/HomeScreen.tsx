import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../auth/AuthContext';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
const PEPPER_ICON = '\uD83C\uDF36\uFE0F';

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Tonight's Lineup</Text>
        <Text style={styles.title}>{`Spice it up ${PEPPER_ICON}`}</Text>
        <Text style={styles.subtitle}>Pick a game, turn up the heat, and keep the whole night inside the same playful world.</Text>
        <Text style={styles.userText}>Signed in as {user?.email}</Text>
      </View>

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutButtonText}>Sign out</Text>
      </Pressable>

      <Pressable style={styles.gameCard} onPress={() => navigation.navigate('DareDiceSetup')}>
        <Text style={styles.gameTitle}>Dare Dice</Text>
        <Text style={styles.gameBody}>Fast dares, shifting intensity, and a fiery little roulette vibe.</Text>
      </Pressable>

      <Pressable style={styles.gameCard} onPress={() => navigation.navigate('SparkBingo')}>
        <Text style={styles.gameTitle}>Spark Bingo</Text>
        <Text style={styles.gameBody}>Mark the board, complete a line, and keep the game moving anywhere.</Text>
      </Pressable>

      <Pressable style={styles.gameCard} onPress={() => navigation.navigate('ActionCam')}>
        <Text style={styles.gameTitle}>Action Cam</Text>
        <Text style={styles.gameBody}>Get a prompt, flip the lens on, and record the move without leaving the app.</Text>
      </Pressable>

      <Pressable style={styles.gameCard} onPress={() => navigation.navigate('Positions')}>
        <Text style={styles.gameTitle}>Positions Simulator</Text>
        <Text style={styles.gameBody}>Shuffle a deck and reveal something bold to try next.</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1f0405',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  hero: {
    marginBottom: 26,
  },
  kicker: {
    color: '#ff9c6b',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#fff6f0',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ffcdb6',
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff2ea',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '700',
  },
  signOutButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#2d0608',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#7d1f23',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  signOutButtonText: {
    color: '#fff2ea',
    fontWeight: '700',
  },
  gameCard: {
    backgroundColor: '#5c1418',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#a43f2f',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  gameTitle: {
    color: '#fff5ef',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  gameBody: {
    color: '#ffd0be',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HomeScreen;
