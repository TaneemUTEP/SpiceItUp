import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../services/supabase';

export type AuthResult = {
  ok: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
};

type AuthContextValue = {
  user: User | null;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setHydrated(true);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Unable to restore authentication session:', error.message);
      setUser(data.session?.user ?? null);
      setHydrated(true);
    }).catch(() => {
      setUser(null);
      setHydrated(true);
    });

    const appStateSubscription = Platform.OS === 'web'
      ? undefined
      : AppState.addEventListener('change', state => {
          if (state === 'active') supabase.auth.startAutoRefresh();
          else supabase.auth.stopAutoRefresh();
        });
    if (Platform.OS !== 'web' && AppState.currentState === 'active') supabase.auth.startAutoRefresh();

    return () => {
      subscription.unsubscribe();
      appStateSubscription?.remove();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { ok: false, error: 'Authentication is not configured yet.' };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { ok: false, error: error.message } : { ok: true };
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { ok: false, error: 'Authentication is not configured yet.' };
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return { ok: false, error: error.message };
    return { ok: true, needsEmailConfirmation: !data.session };
  };

  const signOut = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut();
    return error ? { ok: false, error: error.message } : { ok: true };
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      signIn,
      signUp,
      signOut,
    }),
    [user, hydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
