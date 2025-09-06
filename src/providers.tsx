import BackButtonHandler from "@/lib/components/App/BackButtonHandler";
import { useAppStore } from "@/lib/stores/app.store";
import { useSyncStore } from "@/lib/stores/sync.store";
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
  const setNostrConnectionStatus = useSyncStore(
    (state) => state.setNostrConnectionStatus
  );

  useEffect(() => {
    initTheme();

    // Initialize Nostr connection status
    setNostrConnectionStatus("disconnected");
  }, [initTheme, setNostrConnectionStatus]);

  return (
    <>
      {children}
      <BackButtonHandler />
    </>
  );
}
