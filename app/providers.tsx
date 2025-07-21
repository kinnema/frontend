"use client";

import { Toaster } from "@/components/ui/toaster";
import { useAppStore } from "@/lib/stores/app.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { SafeArea } from "@capacitor-community/safe-area";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PropsWithChildren, useEffect } from "react";
import BackButtonHandler from "../lib/components/App/BackButtonHandler";
import { getAccessToken } from "./actions/auth/getAccessToken";

if (Capacitor.isNativePlatform()) {
  SafeArea.enable({
    config: {},
  });
  StatusBar.setOverlaysWebView({ overlay: false });
  StatusBar.setBackgroundColor({ color: "#000000" });
  StatusBar.setStyle({ style: Style.Dark });
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
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
      if (document.visibilityState === "visible") {
        timeoutId = setTimeout(async () => {
          await checkToken();
          scheduleNextCheck();
        }, 30000);
      }
    };

    checkToken();
    scheduleNextCheck();

    const visibilityHandler = () => {
      if (document.visibilityState === "visible") {
        checkToken();
        scheduleNextCheck();
      } else {
        clearTimeout(timeoutId);
      }
    };

    // Check on focus
    const focusHandler = () => {
      checkToken();
    };

    document.addEventListener("visibilitychange", visibilityHandler);
    window.addEventListener("focus", focusHandler);

    return () => {
      document.removeEventListener("visibilitychange", visibilityHandler);
      window.removeEventListener("focus", focusHandler);
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
      <SpeedInsights />
      <Analytics />
      <BackButtonHandler />
    </QueryClientProvider>
  );
}
