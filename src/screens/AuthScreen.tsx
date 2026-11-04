import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuth } from '../auth/AuthContext';
import { PublicStackParamList } from '../navigation/types';

type Mode = 'login' | 'signup';
type Props = StackScreenProps<PublicStackParamList, 'Auth'>;

const AuthScreen: React.FC<Props> = ({ navigation, route }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>(route.params?.mode ?? 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const actionLabel = mode === 'login' ? 'Log in' : 'Create account';

  const handleSubmit = async () => {
    if (submitting) return;
    setError('');
    setMessage('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result = mode === 'login' ? await signIn(email, password) : await signUp(email, password);
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      if (mode === 'signup' && result.needsEmailConfirmation) {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setMessage('Account created. Check your email to confirm it, then sign in.');
      }
    } catch {
      setError('Could not reach the authentication service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Locked Room</Text>
        <Text style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
        <Text style={styles.subtitle}>Use your email and password to keep your games connected to your account.</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor="#9c6b63"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#9c6b63"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        {mode === 'signup' ? (
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor="#9c6b63"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable style={[styles.primaryButton, submitting && styles.disabledButton]} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fffdfb" /> : <Text style={styles.primaryButtonText}>{actionLabel}</Text>}
        </Pressable>

        <Pressable
          style={styles.linkButton}
          onPress={() => {
            setError('');
            setMessage('');
            setMode(current => (current === 'login' ? 'signup' : 'login'));
          }}
        >
          <Text style={styles.linkText}>
            {mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Log in'}
          </Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back to welcome</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1f0405',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#451015',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#8c3732',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
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
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ffcdb6',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#2d0608',
    color: '#fff6f0',
    borderWidth: 1,
    borderColor: '#7d1f23',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  error: {
    color: '#ffb8b0',
    marginBottom: 12,
    fontWeight: '600',
  },
  message: {
    color: '#bde4bb',
    marginBottom: 12,
    fontWeight: '600',
    lineHeight: 20,
  },
  disabledButton: { opacity: 0.65 },
  primaryButton: {
    backgroundColor: '#f05a28',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffd0aa',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#fffdfb',
    fontWeight: '800',
    fontSize: 16,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 14,
  },
  backButton: { alignItems: 'center', marginTop: 12 },
  linkText: {
    color: '#ffcdb6',
    fontWeight: '700',
  },
});

export default AuthScreen;
