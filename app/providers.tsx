"use client";
import { useAppStore } from "@/lib/stores/app.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useEffect } from "react";

const queryClient = new QueryClient();
export function Providers({ children }: PropsWithChildren) {
  const initTheme = useAppStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
