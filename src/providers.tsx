import BackButtonHandler from "@/lib/components/App/BackButtonHandler";
import { useAppStore } from "@/lib/stores/app.store";
import { useSyncStore } from "@/lib/stores/sync.store";
import { SafeArea } from "@capacitor-community/safe-area";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { PropsWithChildren, useEffect } from "react";
import { SyncProvider } from "./lib/providers/syncProvider";
import { SYNC_CONNECTION_STATUS } from "./lib/types/sync.type";

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
  const isNostrEnabled = useSyncStore((state) => state.isNostrEnabled);

  useEffect(() => {
    initTheme();

    if (isNostrEnabled) {
      setNostrConnectionStatus(SYNC_CONNECTION_STATUS.CONNECTING);
    } else {
      setNostrConnectionStatus(SYNC_CONNECTION_STATUS.DISCONNECTED);
    }

    // Initialize Nostr connection status
    setNostrConnectionStatus(SYNC_CONNECTION_STATUS.DISCONNECTED);
  }, [initTheme, isNostrEnabled, setNostrConnectionStatus]);

  return (
    <>
      <SyncProvider>{children}</SyncProvider>
      <BackButtonHandler />
    </>
  );
}
