import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth Store – Manages user authentication state.
 * Persisted to localStorage so user stays logged in across refreshes.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,       // { phone, name, email, role, reward_points }
      token: null,      // JWT token
      isAuthenticated: false,

      // Set user + token after login/signup
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
      }),

      // Clear auth state
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),

      // Update user data (e.g., after phone update)
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      // Update reward points
      addRewardPoints: (points) => set((state) => ({
        user: state.user
          ? { ...state.user, reward_points: (state.user.reward_points || 0) + points }
          : null,
      })),
    }),
    {
      name: 'cleancity-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
