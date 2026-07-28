import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, type = "info") =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, type },
      ],
    })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Raccourci impératif pour afficher un toast depuis n'importe où. */
export const toast = {
  success: (m: string) => useToastStore.getState().show(m, "success"),
  error: (m: string) => useToastStore.getState().show(m, "error"),
  info: (m: string) => useToastStore.getState().show(m, "info"),
};
