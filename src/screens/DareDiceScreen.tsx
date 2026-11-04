import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Audio } from 'expo-av';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

const spiceItUpDice1 = ['Bite', 'Suck', 'Lick', 'Massage', 'Spank', 'Pinch'];
const spiceItUpDice2 = ['Passionately', 'Roughly', 'Dominantly', 'Sensually', 'Submissively', 'Provocatively'];
const spiceItUpDice3 = ['Your Choice', 'Nipples', 'Toes', 'Inner Thighs', 'XXXtra Naughty Bits', 'Ass'];

const foreplayDice1 = ['Kiss', 'Touch', 'Caress', 'Massage', 'Trace', 'Hold'];
const foreplayDice2 = ['Gently', 'Slowly', 'Playfully', 'Softly', 'Teasingly', 'Warmly'];
const foreplayDice3 = ['Lips', 'Neck', 'Shoulders', 'Hands', 'Waist', 'Back'];

const firstDateDice1 = ['Compliment', 'Hold', 'Hug', 'Brush', 'Whisper to', 'Look at'];
const firstDateDice2 = ['Sweetly', 'Kindly', 'Gently', 'Playfully', 'Softly', 'Adorably'];
const firstDateDice3 = ['Hands', 'Eyes', 'Hair', 'Shoulder', 'Cheek', 'Smile'];

const intensityLabels = ['First date', 'Foreplay', 'Spice it up'];
const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

type DareDiceRoute = RouteProp<RootStackParamList, 'DareDiceNormal' | 'DareDiceRounds'>;

const DareDiceScreen: React.FC = () => {
  const route = useRoute<DareDiceRoute>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const initialPlayers = route.params?.players ?? ['Player 1', 'Player 2'];
  const initialMode: 'normal' | 'rounds' = route.name === 'DareDiceRounds' ? 'rounds' : 'normal';
  const roundsTarget =
    route.name === 'DareDiceRounds'
      ? (route.params as RootStackParamList['DareDiceRounds']).rounds
      : 3;

  const [players, setPlayers] = useState<string[]>(initialPlayers);
  const [mode] = useState<'normal' | 'rounds'>(initialMode);
  const [roundsRemaining, setRoundsRemaining] = useState<number | null>(mode === 'rounds' ? roundsTarget : null);
  const [phase, setPhase] = useState<'idle' | 'rolling' | 'revealed'>('idle');
  const [winnerSelectionVisible, setWinnerSelectionVisible] = useState(false);
  const [winnerCelebrationVisible, setWinnerCelebrationVisible] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [intensityIndex, setIntensityIndex] = useState(0);
  const [rolling1, setRolling1] = useState(false);
  const [rolling2, setRolling2] = useState(false);
  const [rolling3, setRolling3] = useState(false);
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  const [d3, setD3] = useState('');
  const [combos, setCombos] = useState<[string, string][]>([]);
  const [comboIndex, setComboIndex] = useState(0);
  const [chooserIndex, setChooserIndex] = useState(0);
  const [performerIndex, setPerformerIndex] = useState(initialPlayers.length > 1 ? 1 : 0);

  const anim1 = useRef(new Animated.Value(1)).current;
  const anim2 = useRef(new Animated.Value(1)).current;
  const anim3 = useRef(new Animated.Value(1)).current;
  const interval1 = useRef<number | null>(null);
  const interval2 = useRef<number | null>(null);
  const interval3 = useRef<number | null>(null);
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    const nextCombos: [string, string][] = [];
    for (let i = 0; i < players.length; i += 1) {
      for (let j = 0; j < players.length; j += 1) {
        if (i !== j) {
          nextCombos.push([players[i], players[j]]);
        }
      }
    }

    setCombos(nextCombos);
    setChooserIndex(0);
    setPerformerIndex(players.length > 1 ? 1 : 0);
  }, [players]);

  useEffect(() => {
    return () => {
      if (interval1.current) clearInterval(interval1.current);
      if (interval2.current) clearInterval(interval2.current);
      if (interval3.current) clearInterval(interval3.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'rolling' && !rolling1 && !rolling2 && !rolling3) {
      setPhase('revealed');

      const playFinal = async () => {
        try {
          const src = 'https://www.soundjay.com/button/sounds/button-3.mp3';
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const audio = new window.Audio(src);
            await audio.play().catch(() => {});
            return;
          }

          const sound = new Audio.Sound();
          await sound.loadAsync({ uri: src });
          await sound.playAsync();
          setTimeout(async () => {
            try {
              await sound.unloadAsync();
            } catch (e) {
              // ignore unload issues
            }
          }, 800);
        } catch (e) {
          // ignore audio failures
        }
      };

      void playFinal();

      const timeoutId = setTimeout(() => {
        setPhase('idle');
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [phase, rolling1, rolling2, rolling3]);

  const getCurrentDice = () => {
    if (intensityIndex === 0) return { d1: firstDateDice1, d2: firstDateDice2, d3: firstDateDice3 };
    if (intensityIndex === 1) return { d1: foreplayDice1, d2: foreplayDice2, d3: foreplayDice3 };
    return { d1: spiceItUpDice1, d2: spiceItUpDice2, d3: spiceItUpDice3 };
  };

  const startPulse = (anim: Animated.Value) =>
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.15, duration: 140, useNativeDriver: useNative }),
        Animated.timing(anim, { toValue: 1, duration: 140, useNativeDriver: useNative }),
      ])
    );

  const clearIntervalRef = (intervalRef: React.MutableRefObject<number | null>) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetDice = () => {
    clearIntervalRef(interval1);
    clearIntervalRef(interval2);
    clearIntervalRef(interval3);

    setRolling1(false);
    setRolling2(false);
    setRolling3(false);
    setD1('');
    setD2('');
    setD3('');

    Animated.timing(anim1, { toValue: 1, duration: 120, useNativeDriver: useNative }).start();
    Animated.timing(anim2, { toValue: 1, duration: 120, useNativeDriver: useNative }).start();
    Animated.timing(anim3, { toValue: 1, duration: 120, useNativeDriver: useNative }).start();
    setPhase('idle');
  };

  const startRoll = async (
    values: string[],
    setValue: (value: string) => void,
    isRolling: boolean,
    setRolling: (value: boolean) => void,
    anim: Animated.Value,
    intervalRef: React.MutableRefObject<number | null>
  ) => {
    if (isRolling) return;

    setRolling(true);
    const pulse = startPulse(anim);
    pulse.start();

    let sound:
      | {
          stopAsync: () => Promise<void>;
          unloadAsync: () => Promise<void>;
        }
      | Audio.Sound
      | null = null;

    try {
      const src = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const audio = new window.Audio(src);
        audio.loop = true;
        await audio.play().catch(() => {});
        sound = {
          stopAsync: async () => {
            audio.pause();
            audio.currentTime = 0;
          },
          unloadAsync: async () => {
            audio.src = '';
          },
        };
      } else {
        sound = new Audio.Sound();
        await sound.loadAsync({ uri: src });
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
      }
    } catch (e) {
      sound = null;
    }

    intervalRef.current = setInterval(() => {
      setValue(randomFrom(values));
    }, 80) as unknown as number;

    const duration = 800 + Math.floor(Math.random() * 900);

    setTimeout(async () => {
      clearIntervalRef(intervalRef);
      setValue(randomFrom(values));
      pulse.stop();
      Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: useNative }).start();

      try {
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
      } catch (e) {
        // ignore audio cleanup failures
      }

      setRolling(false);
    }, duration);
  };

  const rollD1 = () => {
    const { d1: values } = getCurrentDice();
    void startRoll(values, setD1, rolling1, setRolling1, anim1, interval1);
  };

  const rollD2 = () => {
    const { d2: values } = getCurrentDice();
    void startRoll(values, setD2, rolling2, setRolling2, anim2, interval2);
  };

  const rollD3 = () => {
    const { d3: values } = getCurrentDice();
    void startRoll(values, setD3, rolling3, setRolling3, anim3, interval3);
  };

  const rollAll = () => {
    if (rolling1 || rolling2 || rolling3) return;
    setPhase('rolling');
    rollD1();
    rollD2();
    rollD3();
  };

  const changeIntensity = (nextIndex: number) => {
    if (nextIndex === intensityIndex) return;
    if (d1 || d2 || d3 || rolling1 || rolling2 || rolling3) {
      resetDice();
    }
    setIntensityIndex(nextIndex);
  };

  const advanceRoles = () => {
    if (mode === 'rounds') {
      setComboIndex(current => {
        const next = current + 1;
        if (next < combos.length) {
          resetDice();
          return next;
        }

        setRoundsRemaining(previous => {
          const remaining = (previous ?? roundsTarget) - 1;
          if (remaining <= 0) {
            resetDice();
            setWinnerSelectionVisible(true);
            return null;
          }

          resetDice();
          return remaining;
        });

        return 0;
      });
      return;
    }

    const newChooser = performerIndex;
    const newPerformer = (performerIndex + 1) % players.length;
    setChooserIndex(newChooser);
    setPerformerIndex(newPerformer);
    resetDice();
  };

  const currentChooser = mode === 'rounds' ? combos[comboIndex]?.[0] ?? '-' : players[chooserIndex] ?? '-';
  const currentPerformer = mode === 'rounds' ? combos[comboIndex]?.[1] ?? '-' : players[performerIndex] ?? '-';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <Text style={styles.title}>Dare Dice</Text>

      <View style={styles.topPanel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelKicker}>Live Round</Text>
            <Text style={styles.panelTitle}>Set the mood, then roll</Text>
          </View>
          {mode === 'rounds' ? (
            <View style={styles.roundBadge}>
              <Text style={styles.roundBadgeLabel}>Rounds Left</Text>
              <Text style={styles.roundBadgeValue}>{roundsRemaining ?? roundsTarget}</Text>
            </View>
          ) : (
            <Pressable style={styles.secondaryAction} onPress={() => setPlayers(current => (current.length <= 1 ? current : [...current.slice(1), current[0]]))}>
              <Text style={styles.secondaryActionText}>Swap Roles</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.playerPillsRow}>
          <View style={styles.playerPill}>
            <Text style={styles.playerPillLabel}>Chooser</Text>
            <Text style={styles.playerPillValue}>{currentChooser}</Text>
          </View>
          <View style={styles.playerPill}>
            <Text style={styles.playerPillLabel}>Performer</Text>
            <Text style={styles.playerPillValue}>{currentPerformer}</Text>
          </View>
        </View>

        <View style={styles.intensityCard}>
          <Text style={styles.sectionLabel}>Intensity</Text>
          <View style={styles.intensityRow}>
            <Pressable
              style={[styles.iconAction, intensityIndex === 0 && styles.iconActionDisabled]}
              onPress={() => changeIntensity(intensityIndex - 1)}
              disabled={intensityIndex === 0}
            >
              <Text style={styles.iconActionText}>-</Text>
            </Pressable>

            <View style={styles.intensityCenter}>
              <Text style={styles.intensityValue}>{intensityLabels[intensityIndex]}</Text>
              <Text style={styles.intensityHint}>Move left or right to match the room.</Text>
            </View>

            <Pressable
              style={[styles.iconAction, intensityIndex === intensityLabels.length - 1 && styles.iconActionDisabled]}
              onPress={() => changeIntensity(intensityIndex + 1)}
              disabled={intensityIndex === intensityLabels.length - 1}
            >
              <Text style={styles.iconActionText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.primaryAction, (rolling1 || rolling2 || rolling3) && styles.actionDisabled]}
            onPress={rollAll}
            disabled={rolling1 || rolling2 || rolling3}
          >
            <Text style={styles.primaryActionText}>Roll All</Text>
          </Pressable>

          <Pressable style={styles.secondaryActionWide} onPress={mode === 'rounds' ? advanceRoles : resetDice}>
            <Text style={styles.secondaryActionText}>{mode === 'rounds' ? 'Next Pairing' : 'Reset Dice'}</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={winnerSelectionVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Who owned the heat?</Text>
            <View style={styles.winnerTilesRow}>
              {players.map((player, index) => (
                <TouchableOpacity
                  key={`${player}-${index}`}
                  style={styles.winnerTile}
                  onPress={() => {
                    setWinnerName(player);
                    setWinnerSelectionVisible(false);
                    setWinnerCelebrationVisible(true);
                  }}
                >
                  <Text style={styles.winnerName}>{player}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.spacer12} />
            <Pressable style={styles.secondaryActionWide} onPress={() => setWinnerSelectionVisible(false)}>
              <Text style={styles.secondaryActionText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={winnerCelebrationVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.winnerTitle}>Winner: {winnerName}</Text>
            <Pressable
              style={styles.primaryAction}
              onPress={() => {
                setWinnerCelebrationVisible(false);
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.primaryActionText}>Play Another Game</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.diceRow}>
        <View style={styles.dieCol}>
          <Text style={styles.label}>Action</Text>
          <Animated.View style={[styles.dieFace, { transform: [{ scale: anim1 }] }]}>
            <Text style={styles.dieText}>{d1 || '-'}</Text>
          </Animated.View>
          <Pressable style={[styles.dieButton, rolling1 && styles.actionDisabled]} onPress={rollD1} disabled={rolling1}>
            <Text style={styles.dieButtonText}>Roll Action</Text>
          </Pressable>
        </View>

        <View style={styles.dieCol}>
          <Text style={styles.label}>Style</Text>
          <Animated.View style={[styles.dieFace, { transform: [{ scale: anim2 }] }]}>
            <Text style={styles.dieText}>{d2 || '-'}</Text>
          </Animated.View>
          <Pressable style={[styles.dieButton, rolling2 && styles.actionDisabled]} onPress={rollD2} disabled={rolling2}>
            <Text style={styles.dieButtonText}>Roll Style</Text>
          </Pressable>
        </View>

        <View style={styles.dieCol}>
          <Text style={styles.label}>Target</Text>
          <Animated.View style={[styles.dieFace, { transform: [{ scale: anim3 }] }]}>
            <Text style={styles.dieText}>{d3 || '-'}</Text>
          </Animated.View>
          <Pressable style={[styles.dieButton, rolling3 && styles.actionDisabled]} onPress={rollD3} disabled={rolling3}>
            <Text style={styles.dieButtonText}>Roll Target</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.combinedContainer}>
        <Text style={styles.combinedTitle}>Combined</Text>
        <Text style={styles.combined}>{d1 && d2 && d3 ? `${d1} ${d2} ${d3}` : 'Roll the dice to get a dare.'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#260708',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    marginBottom: 18,
    color: '#fff3eb',
    fontWeight: '800',
    textAlign: 'center',
  },
  topPanel: {
    width: '100%',
    backgroundColor: '#4d1418',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#803237',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  panelKicker: {
    color: '#ffb28f',
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  panelTitle: {
    color: '#fff4ee',
    fontSize: 22,
    fontWeight: '800',
  },
  roundBadge: {
    minWidth: 96,
    backgroundColor: '#351013',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#744044',
    alignItems: 'center',
  },
  roundBadgeLabel: {
    color: '#f2bca6',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  roundBadgeValue: {
    color: '#fff6f1',
    fontSize: 24,
    fontWeight: '800',
  },
  playerPillsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  playerPill: {
    flex: 1,
    backgroundColor: '#351013',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#744044',
  },
  playerPillLabel: {
    color: '#eeb7a0',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  playerPillValue: {
    color: '#fff5ef',
    fontSize: 17,
    fontWeight: '700',
  },
  intensityCard: {
    width: '100%',
    backgroundColor: '#351013',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#744044',
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#f2bca6',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  intensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  intensityCenter: {
    flex: 1,
    alignItems: 'center',
  },
  intensityValue: {
    color: '#fff4ee',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  intensityHint: {
    color: '#dcae9f',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  iconAction: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f05a28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionDisabled: {
    opacity: 0.35,
  },
  iconActionText: {
    color: '#fff9f5',
    fontSize: 24,
    fontWeight: '800',
    marginTop: -2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#c1271f',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffb16f',
  },
  primaryActionText: {
    color: '#fff9f5',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryAction: {
    backgroundColor: '#351013',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#744044',
  },
  secondaryActionWide: {
    flex: 1,
    backgroundColor: '#351013',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#744044',
  },
  secondaryActionText: {
    color: '#fff1e8',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionDisabled: {
    opacity: 0.45,
  },
  diceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    marginBottom: 18,
    gap: 10,
  },
  dieCol: {
    flex: 1,
    alignItems: 'center',
  },
  dieFace: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#fff1e8',
    borderWidth: 2,
    borderColor: '#ff9d6f',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 5,
  },
  dieText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 6,
    color: '#61201f',
    fontWeight: '700',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    color: '#ffd6c7',
  },
  dieButton: {
    width: '100%',
    backgroundColor: '#5c1418',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a43f2f',
  },
  dieButtonText: {
    color: '#fff4ee',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 13,
  },
  combinedContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#4d1418',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#803237',
  },
  combinedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffb28f',
  },
  combined: {
    fontSize: 20,
    marginTop: 8,
    textAlign: 'center',
    color: '#fff4ee',
    lineHeight: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22,4,4,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#431114',
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8a3638',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#fff3eb',
  },
  winnerTilesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  winnerTile: {
    minWidth: 96,
    marginHorizontal: 6,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a74d44',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6c1c22',
  },
  winnerName: {
    fontSize: 16,
    color: '#fff3eb',
    fontWeight: '700',
  },
  winnerTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    color: '#fff3eb',
    textAlign: 'center',
  },
  spacer12: {
    height: 12,
  },
});

export default DareDiceScreen;
