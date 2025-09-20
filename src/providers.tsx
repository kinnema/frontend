import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/lib/stores/app.store";
import { SafeArea } from "@capacitor-community/safe-area";
import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { PropsWithChildren, Suspense, lazy, useEffect } from "react";
import { Loading } from "./components/Loading";
import { isNativePlatform } from "./lib/utils/native";

const BackButtonHandler = lazy(
  () => import("@/components/App/BackButtonHandler")
);

if (Capacitor.isNativePlatform()) {
  const { StatusBar, Style } = await import("@capacitor/status-bar");
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

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      <Suspense fallback={<Loading fullscreen />}>
        {children}
        <Toaster />
        {isNativePlatform() && <BackButtonHandler />}
      </Suspense>
    </>
  );
}
