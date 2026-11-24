import { create } from "zustand";
import type { User } from "firebase/auth";
import type { Plan, SavedBook } from "./types";
type State = {
  user: User | null;
  ready: boolean;
  plan: Plan;
  subscriptionReady: boolean;
  authOpen: boolean;
  authMode: "login" | "register" | "reset";
  sidebarOpen: boolean;
  library: SavedBook[];
  libraryReady: boolean;
  serviceError: string;
  openAuth: (mode?: State["authMode"]) => void;
  closeAuth: () => void;
  setSidebar: (open: boolean) => void;
};
export const useAppStore = create<State>((set) => ({
  user: null,
  ready: false,
  plan: "basic",
  subscriptionReady: false,
  authOpen: false,
  authMode: "login",
  sidebarOpen: false,
  library: [],
  libraryReady: false,
  serviceError: "",
  openAuth: (mode = "login") => set({ authOpen: true, authMode: mode }),
  closeAuth: () => set({ authOpen: false }),
  setSidebar: (sidebarOpen) => set({ sidebarOpen }),
}));
