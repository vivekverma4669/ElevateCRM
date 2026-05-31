import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),

      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: 'elevatecrm-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
