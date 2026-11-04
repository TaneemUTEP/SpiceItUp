import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { PublicStackParamList } from '../navigation/types';

type Props = StackScreenProps<PublicStackParamList, 'Landing'>;

const LandingScreen: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.page}>
      <View style={[styles.content, { maxWidth: width > 760 ? 760 : 520 }]}>
        <Text style={styles.eyebrow}>A little spark for tonight</Text>
        <Text style={styles.brand}>Spice it up <Text style={styles.pepper}>\uD83C\uDF36\uFE0F</Text></Text>
        <Text style={[styles.headline, { fontSize: width < 380 ? 38 : 46, lineHeight: width < 380 ? 44 : 52 }]}>Make room for a little more play.</Text>
        <Text style={styles.description}>
          Pick a game, follow a surprise prompt, and make the evening your own. Start with a free account when you’re ready.
        </Text>

        <View style={styles.gameStrip}>
          <View style={styles.gameMark}><Text style={styles.gameEmoji}>🎲</Text><Text style={styles.gameName}>Dare Dice</Text></View>
          <View style={styles.gameMark}><Text style={styles.gameEmoji}>✦</Text><Text style={styles.gameName}>Spark Bingo</Text></View>
          <View style={styles.gameMark}><Text style={styles.gameEmoji}>◉</Text><Text style={styles.gameName}>Action Cam</Text></View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Auth', { mode: 'signup' })}>
            <Text style={styles.primaryText}>Create your account</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Auth', { mode: 'login' })}>
            <Text style={styles.secondaryText}>I already have an account</Text>
          </Pressable>
        </View>
        <Text style={styles.note}>Private play starts after you sign in.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1f0405' },
  page: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { width: '100%', alignSelf: 'center' },
  eyebrow: { color: '#ff9c6b', fontSize: 13, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  brand: { color: '#fff6f0', fontSize: 25, fontWeight: '900', marginBottom: 38 },
  pepper: { color: '#ff9c6b' },
  headline: { color: '#fff6f0', fontSize: 46, lineHeight: 52, fontWeight: '900', letterSpacing: -1.2, maxWidth: 640 },
  description: { color: '#ffcdb6', fontSize: 17, lineHeight: 25, marginTop: 16, maxWidth: 560 },
  gameStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 30 },
  gameMark: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#7d1f23', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#2d0608' },
  gameEmoji: { color: '#ff9c6b', fontSize: 15, fontWeight: '800' },
  gameName: { color: '#fff2ea', fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 34 },
  primaryButton: { backgroundColor: '#f05a28', borderRadius: 15, paddingHorizontal: 20, paddingVertical: 14, borderWidth: 1, borderColor: '#ffd0aa' },
  primaryText: { color: '#fffdfb', fontSize: 15, fontWeight: '900' },
  secondaryButton: { backgroundColor: '#451015', borderRadius: 15, paddingHorizontal: 18, paddingVertical: 14, borderWidth: 1, borderColor: '#8c3732' },
  secondaryText: { color: '#fff3ec', fontSize: 15, fontWeight: '700' },
  note: { color: '#bf8a7e', fontSize: 13, marginTop: 18 },
});

export default LandingScreen;
