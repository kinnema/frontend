import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/lib/stores/app.store";
import { useSyncStore } from "@/lib/stores/sync.store";
import { SafeArea } from "@capacitor-community/safe-area";
import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { PropsWithChildren, Suspense, lazy, useEffect } from "react";
import { Loading } from "./lib/components/Loading";
import { SYNC_CONNECTION_STATUS } from "./lib/types/sync.type";
import { isNativePlatform } from "./lib/utils/native";

const SyncProvider = lazy(() => import("./lib/providers/syncProvider"));
const BackButtonHandler = lazy(
  () => import("@/lib/components/App/BackButtonHandler")
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
      <Suspense fallback={<Loading fullscreen />}>
        <SyncProvider>
          {children}
          <Toaster />
        </SyncProvider>
        {isNativePlatform() && <BackButtonHandler />}
      </Suspense>
    </>
  );
}
