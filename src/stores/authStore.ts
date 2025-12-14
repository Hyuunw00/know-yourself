import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { signIn, signUp, signOut, getCurrentUser } from '@/services';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;

  // 액션
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const user = await getCurrentUser();
    set({ user, isInitialized: true });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    const { user, error } = await signIn(email, password);
    set({ user, isLoading: false });
    return { error };
  },

  signup: async (email: string, password: string) => {
    set({ isLoading: true });
    const { error } = await signUp(email, password);
    set({ isLoading: false });
    return { error };
  },

  logout: async () => {
    set({ isLoading: true });
    await signOut();
    set({ user: null, isLoading: false });
  },

  setUser: (user: User | null) => {
    set({ user });
  },
}));
