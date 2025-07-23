import { getAccessToken } from "@/app/actions/auth/getAccessToken";
import BackButtonHandler from "@/lib/components/App/BackButtonHandler";
import { useAppStore } from "@/lib/stores/app.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { SafeArea } from "@capacitor-community/safe-area";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { PropsWithChildren, useEffect } from "react";

if (Capacitor.isNativePlatform()) {
  CapacitorUpdater.notifyAppReady();

  SafeArea.enable({
    config: {},
  });
  StatusBar.setOverlaysWebView({ overlay: false });
  StatusBar.setBackgroundColor({ color: "#000000" });
  StatusBar.setStyle({ style: Style.Dark });
}

export function Providers({ children }: PropsWithChildren) {
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
    <>
      {children}
      <BackButtonHandler />
    </>
  );
}
