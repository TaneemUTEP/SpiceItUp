import React from 'react';
import { ActivityIndicator, LogBox, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './src/screens/AuthScreen';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import DareDiceSetup from './src/screens/DareDiceSetup';
import DareDiceNormal from './src/screens/DareDiceScreen';
import DareDiceRounds from './src/screens/DareDiceScreen';
import SparkBingoScreen from './src/screens/SparkBingoScreen';
import PositionsScreen from './src/screens/PositionsScreen';
import ActionCamScreen from './src/screens/ActionCamScreen';
import LandingScreen from './src/screens/LandingScreen';
import { PublicStackParamList, RootStackParamList } from './src/navigation/types';

const AppStack = createStackNavigator<RootStackParamList>();
const PublicStack = createStackNavigator<PublicStackParamList>();
const PEPPER_ICON = '\uD83C\uDF36\uFE0F';

// Suppress specific noisy react-native-web warnings in the browser console.
// We keep LogBox.ignoreLogs for native, and additionally patch console on web.
if (typeof window !== 'undefined' && typeof console !== 'undefined') {
  const suppressed = [
    'shadow',
    'pointerEvents is deprecated',
    'style.resizeMode is deprecated',
    'style.tintColor is deprecated',
    'useNativeDriver is not supported',
  ];

  const originalWarn = console.warn.bind(console);
  console.warn = (...args: any[]) => {
    try {
      const msg = String(args[0] ?? '');
      if (suppressed.some(sub => msg.includes(sub))) return;
    } catch (e) {
      // fall through to the original logger
    }
    originalWarn(...args);
  };

  const originalError = console.error.bind(console);
  console.error = (...args: any[]) => {
    try {
      const msg = String(args[0] ?? '');
      if (suppressed.some(sub => msg.includes(sub))) return;
    } catch (e) {
      // fall through to the original logger
    }
    originalError(...args);
  };
}

const App: React.FC = () => {
  LogBox.ignoreLogs([
    'shadow* style props are deprecated',
    'pointerEvents is deprecated',
    'style.resizeMode is deprecated',
    'style.tintColor is deprecated',
    'useNativeDriver is not supported',
  ]);

  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
};

const AppRoot: React.FC = () => {
  const { user, hydrated } = useAuth();

  if (!hydrated) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#f05a28" />
        <Text style={styles.loadingText}>Loading your session...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppNavigator />
      ) : (
        <PublicNavigator />
      )}
    </NavigationContainer>
  );
};

const AppNavigator: React.FC = () => (
  <AppStack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerStyle: { backgroundColor: '#3b0d10' },
      headerTintColor: '#fff2ea',
      headerTitleStyle: { fontWeight: '700' },
      cardStyle: { backgroundColor: '#260708' },
    }}
  >
    <AppStack.Screen name="Home" component={HomeScreen} options={{ title: `Spice it up ${PEPPER_ICON}` }} />
    <AppStack.Screen name="DareDiceSetup" component={DareDiceSetup} options={{ title: 'Dare Dice Setup' }} />
    <AppStack.Screen name="DareDiceNormal" component={DareDiceNormal} options={{ title: 'Dare Dice' }} />
    <AppStack.Screen name="DareDiceRounds" component={DareDiceRounds} options={{ title: 'Dare Dice Rounds' }} />
    <AppStack.Screen name="SparkBingo" component={SparkBingoScreen} options={{ title: 'Spicy bingo' }} />
    <AppStack.Screen name="Positions" component={PositionsScreen} options={{ title: 'Positions Simulator' }} />
    <AppStack.Screen name="ActionCam" component={ActionCamScreen} options={{ title: 'Action Cam' }} />
  </AppStack.Navigator>
);

const PublicNavigator: React.FC = () => (
  <PublicStack.Navigator
    initialRouteName="Landing"
    screenOptions={{
      headerStyle: { backgroundColor: '#3b0d10' },
      headerTintColor: '#fff2ea',
      headerTitleStyle: { fontWeight: '700' },
      cardStyle: { backgroundColor: '#260708' },
    }}
  >
    <PublicStack.Screen name="Landing" component={LandingScreen} options={{ title: 'Spice it up' }} />
    <PublicStack.Screen name="Auth" component={AuthScreen} options={{ title: 'Your account' }} />
  </PublicStack.Navigator>
);

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f0405',
    gap: 12,
  },
  loadingText: {
    color: '#fff2ea',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});

export default App;
