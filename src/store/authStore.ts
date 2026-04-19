import { create } from 'zustand';

export interface User {
  id: string;
  nickname: string;
  totalCultivation: number;
  currentRealmId: number | null;
  mainBodyTypeId: number | null;
  realm?: {
    name: string;
    stage: string;
    subStage: string;
    level: string;
    minCultivation: number;
  };
  mainBodyType?: {
    name: string;
    language: string;
    description: string;
  };
  progressSummary?: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    currentStreak: number;
    longestStreak: number;
  };
}

interface AuthState {
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userId: localStorage.getItem('userId'),
  isAuthenticated: !!localStorage.getItem('userId'),
  login: (user) => {
    localStorage.setItem('userId', user.id);
    set({ user, userId: user.id, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('userId');
    set({ user: null, userId: null, isAuthenticated: false });
  },
  setUser: (user) => set({ user }),
}));
