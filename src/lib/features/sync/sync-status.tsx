import { Badge } from "@/components/ui/badge";
import { useExperimentalStore } from "@/lib/stores/experimental.store";
import { ExperimentalFeature } from "@/lib/types/experiementalFeatures";
import { useRouter } from "@tanstack/react-router";
import clsx from "clsx";
import {
  AlertCircle,
  CheckCircle,
  Globe,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { lastSyncedAt$, syncingStatus$ } from "./observables";
import { useSyncStore } from "./store";
import { ConnectionStatus } from "./types";

interface SyncStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function SyncStatus({ showDetails = true, className }: SyncStatusProps) {
  const isExperimentalFeatureEnabled = useExperimentalStore((state) =>
    state.isFeatureEnabled(ExperimentalFeature.Sync)
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastNostrSync, setLastNostrSync] = useState<Date | null>(null);
  const isActive = useSyncStore((state) => state.isActive);
  const isP2PEnabled = useSyncStore(
    (state) =>
      state.webrtcStatus === ConnectionStatus.CONNECTED ||
      state.webrtcStatus === ConnectionStatus.CONNECTING ||
      state.webrtcStatus === ConnectionStatus.ERROR
  );
  const isNostrEnabled = useSyncStore(
    (state) =>
      state.nostrStatus === ConnectionStatus.CONNECTED ||
      state.nostrStatus === ConnectionStatus.CONNECTING ||
      state.nostrStatus === ConnectionStatus.ERROR
  );
  const router = useRouter();

  useEffect(() => {
    const syncingStatusSubscription = syncingStatus$.subscribe((isSyncing) => {
      setIsSyncing(isSyncing);
    });

    const lastSyncedAtSubscription = lastSyncedAt$.subscribe((date) => {
      setLastNostrSync(date);
    });

    return () => {
      syncingStatusSubscription.unsubscribe();
      lastSyncedAtSubscription.unsubscribe();
    };
  }, []);

  const getSyncStatus = () => {
    if (!isActive) {
      return { status: "disabled", label: "Sync Disabled", color: "muted" };
    }

    if (isSyncing) {
      return { status: "syncing", label: "Syncing...", color: "blue" };
    }

    return {
      status: "enabled",
      label: "Sync Enabled",
      color: "green",
    };
  };

  const { status, label, color } = getSyncStatus();

  const getStatusIcon = () => {
    switch (status) {
      case "syncing":
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case "connected":
        return <CheckCircle className="h-3 w-3 text-white-500" />;
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case "enabled":
        return <Wifi className="h-3 w-3 text-yellow-500" />;
      default:
        return <WifiOff className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const handleClick = async () => {
    await router.navigate({ to: "/settings/sync" });
  };

  if (!isExperimentalFeatureEnabled) {
    return null;
  }

  return (
    <div className={clsx("cursor-pointer", className)} onClick={handleClick}>
      <div className="flex items-center gap-2">
        <Badge variant={color as any} className="flex items-center gap-1">
          {getStatusIcon()}
          {label}
        </Badge>

        {showDetails && (
          <div className="flex items-center gap-1">
            {isP2PEnabled && (
              <Badge variant="outline" className="text-xs">
                <Wifi className="h-2 w-2 mr-1" />
                P2P
              </Badge>
            )}
            {isNostrEnabled && (
              <Badge variant="outline" className="text-xs">
                <Globe className="h-2 w-2 mr-1" />
                Nostr
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* {showDetails && lastNostrSync && (
        <p className="text-xs text-muted-foreground mt-1">
          Last sync: {new Date(lastNostrSync).toLocaleString()}
        </p>
      )} */}
    </div>
  );
}
