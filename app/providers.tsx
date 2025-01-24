"use client";

import { Toaster } from "@/components/ui/toaster";
import { useAppStore } from "@/lib/stores/app.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useEffect } from "react";
import "swiper/css";
import { getAccessToken } from "./actions/auth/getAccessToken";
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
export function Providers({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();
  const initTheme = useAppStore((state) => state.initTheme);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logOut = useAuthStore((state) => state.logOut);

  useEffect(() => {
    if (!isLoggedIn) return;

    const checkToken = async () => {
      const token = await getAccessToken();
      if (!token && isLoggedIn) {
        logOut();
      }
    };

    let timeoutId: NodeJS.Timeout;

    const scheduleNextCheck = () => {
      // Only schedule next check if page is visible
      if (document.visibilityState === 'visible') {
        timeoutId = setTimeout(async () => {
          await checkToken();
          scheduleNextCheck();
        }, 30000); // Check every 30 seconds when visible
      }
    };

    // Initial check and start periodic checks
    checkToken();
    scheduleNextCheck();

    // Check when tab becomes visible
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        checkToken();
        scheduleNextCheck();
      } else {
        // Clear timeout when page becomes hidden
        clearTimeout(timeoutId);
      }
    };

    // Check on focus
    const focusHandler = () => {
      checkToken();
    };

    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('focus', focusHandler);

    return () => {
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('focus', focusHandler);
      clearTimeout(timeoutId);
    };
  }, [isLoggedIn, logOut]);

  useEffect(() => {
    if (!isLoggedIn) return;

    getAccessToken().then((token) => {
      if (token) {
        localStorage.setItem("access_token", token);
      }
    });
  }, [isLoggedIn]);

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <div className="z-10">
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
