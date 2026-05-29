import { useSyncExternalStore } from "react";

type State = {
  open: boolean;
  resource: any | null;
};

let state: State = { open: false, resource: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const previewModal = {
  show(resource: any) {
    state = { open: true, resource };
    emit();
  },
  hide() {
    state = { open: false, resource: null };
    emit();
  },
};

export function usePreviewModal() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}
