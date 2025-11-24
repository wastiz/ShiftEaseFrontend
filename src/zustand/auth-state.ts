import { create } from "zustand";
import { persist } from "zustand/middleware";
import {User} from "@/types";

type AuthState = {
    user: User | null;
    setUser: (user: User) => void;
    clearAuth: () => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist<AuthState>(
        (set) => ({
            user: null,

            setUser: (user) => set({ user }),

            clearAuth: () => set({ user: null }),

            logout: () => {
                set({ user: null });
                window.location.href = "/auth/sign-in";
            },
        }),
        {
            name: "auth-storage",
            partialize: (state): Partial<AuthState> => ({ user: state.user }),
        }
    )
);

