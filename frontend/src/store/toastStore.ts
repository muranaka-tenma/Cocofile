import { create } from "zustand";
import type { Toast, ToastType } from "@/components/ui/toast";

interface ToastStore {
  toasts: Toast[];
  addToast: (
    type: ToastType,
    title: string,
    description?: string,
    options?: {
      action?: { label: string; onClick: () => void };
      duration?: number;
    },
  ) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, title, description, options) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = {
      id,
      type,
      title,
      description,
      action: options?.action,
      duration: options?.duration,
    };
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clearAllToasts: () => set({ toasts: [] }),
}));

// Helper functions for common toast types
export const toast = {
  success: (title: string, description?: string) => {
    useToastStore.getState().addToast("success", title, description);
  },
  error: (title: string, description?: string) => {
    useToastStore.getState().addToast("error", title, description);
  },
  warning: (title: string, description?: string) => {
    useToastStore.getState().addToast("warning", title, description);
  },
  info: (title: string, description?: string) => {
    useToastStore.getState().addToast("info", title, description);
  },
};
