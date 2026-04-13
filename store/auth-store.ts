import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "guest" | "staff" | "admin";
  approved: boolean;
  image?: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ isLoading: loading }),

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
          console.error("Logout error", e);
        }
        set({ user: null, isAuthenticated: false });
      },

      hydrate: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          if (res.ok) {
            const user = await res.json();
            set({ user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    { name: "auth-store" }
  )
);
