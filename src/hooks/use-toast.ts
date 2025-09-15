import { useCallback } from "react";
import type { Action } from "sonner";
import { toast as sonner } from "sonner";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  action?: Action;
}

export function toast(options: ToastOptions) {
  const variantMap = {
    destructive: sonner.error,
    success: sonner.success,
    warning: sonner.warning,
    info: sonner.info,
    default: sonner.info,
  };

  const showToast = variantMap[options.variant ?? "default"] ?? sonner;

  showToast(options.title, { description: options.description });
}

export function useToast() {
  const _toast = useCallback((options: ToastOptions) => {
    toast(options);
  }, []);

  return { toast: _toast };
}
