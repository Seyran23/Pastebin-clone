import { create } from 'zustand';

import { refreshingTokens } from '@/lib/api';
import { IUserInfo } from '@/lib/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: IUserInfo | null;
  isAuthenticated: boolean;
  saveAccessToken: (accessToken: string) => void;
  saveRefreshToken: (refreshToken: string) => void;
  setUserInfo: (user: IUserInfo) => void;
  setIsAuthenticatedState: (state: boolean) => void;
  updateUserAvatar: (newAvatar: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null,
  user: (() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as IUserInfo;
    } catch {
      return null;
    }
  })(),
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem(ACCESS_TOKEN_KEY) : false,

  saveAccessToken: (accessToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    set({ accessToken, isAuthenticated: true });
  },

  saveRefreshToken: (refreshToken) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    set({ refreshToken, isAuthenticated: true });
  },

  setUserInfo: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  setIsAuthenticatedState: (state) => {
    set({ isAuthenticated: state });
  },

  updateUserAvatar: (newAvatarUrl: string) => {
    // Update localStorage
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.avatar = newAvatarUrl;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    // Update Zustand state
    set((state) => ({
      user: state.user ? { ...state.user, avatar: newAvatarUrl } : null
    }));
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  refreshAccessToken: async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
    if (!refreshToken) return;

    try {
      const res = await refreshingTokens();
      const newAccess = res.data.accessToken;
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
      set({ accessToken: newAccess, isAuthenticated: true });
    } catch (error) {
      console.error('Refresh token failed:', error);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ accessToken: null, user: null, isAuthenticated: false });
    }
  },
}));
