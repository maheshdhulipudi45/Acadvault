// Lightweight global store without extra deps
type State = {
  open: boolean;
  mode: "login" | "signup";
  message?: string;
  show: (mode?: "login" | "signup", message?: string) => void;
  hide: () => void;
  setMode: (mode: "login" | "signup") => void;
};

import { useSyncExternalStore } from "react";

let state: Omit<State, "show" | "hide" | "setMode"> = {
  open: false,
  mode: "login",
  message: undefined,
};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const authModal = {
  show(mode: "login" | "signup" = "login", message?: string) {
    state = { open: true, mode, message };
    emit();
  },
  hide() {
    state = { ...state, open: false };
    emit();
  },
  setMode(mode: "login" | "signup") {
    state = { ...state, mode };
    emit();
  },
};

export function useAuthModal() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}
