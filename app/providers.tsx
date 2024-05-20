"use client";
import { Search } from "@/lib/components/Search";
import { useAppStore } from "@/lib/stores/app.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useEffect } from "react";

const queryClient = new QueryClient();
export function Providers({ children }: PropsWithChildren) {
  const initTheme = useAppStore((state) => state.initTheme);
  const isSearchMode = useAppStore((state) => state.searchMode);
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <Search isSearchMode={isSearchMode} />
    </QueryClientProvider>
  );
}
