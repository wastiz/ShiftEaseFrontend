import { create } from "zustand";

type ServerErrorState = {
    isServerDown: boolean;
    setServerDown: (down: boolean) => void;
};

export const useServerErrorStore = create<ServerErrorState>((set) => ({
    isServerDown: false,
    setServerDown: (down: boolean) => set({ isServerDown: down }),
}));
