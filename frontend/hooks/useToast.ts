'use client';
import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

type ToastInput = Omit<Toast, 'id'>;

let toastFn: ((toast: ToastInput) => void) | null = null;

export function registerToast(fn: (toast: ToastInput) => void) {
  toastFn = fn;
}

export function toast(input: ToastInput) {
  if (toastFn) toastFn(input);
}

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((input: ToastInput) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...input, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  registerToast(addToast);

  return { toasts, dismiss: (id: string) => setToasts((p) => p.filter((t) => t.id !== id)) };
}
