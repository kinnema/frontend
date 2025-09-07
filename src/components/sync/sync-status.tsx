import { Badge } from "@/components/ui/badge";
import { useSyncStore } from "@/lib/stores/sync.store";
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

interface SyncStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function SyncStatus({ showDetails = true, className }: SyncStatusProps) {
  const isP2PEnabled = useSyncStore((state) => state.isP2PEnabled);
  const isNostrEnabled = useSyncStore((state) => state.isNostrEnabled);
  const nostrConnectionStatus = useSyncStore(
    (state) => state.nostrConnectionStatus
  );
  const nostrSyncInProgress = useSyncStore(
    (state) => state.nostrSyncInProgress
  );
  const lastNostrSync = useSyncStore((state) => state.lastNostrSync);
  const peers = useSyncStore((state) => state.peers);
  const router = useRouter();
  const getSyncStatus = () => {
    if (nostrSyncInProgress)
      return { status: "syncing", label: "Syncing", color: "secondary" };
    if (isP2PEnabled && peers.length > 0)
      return { status: "connected", label: "P2P Active", color: "default" };
    if (isNostrEnabled && nostrConnectionStatus === "connected")
      return { status: "connected", label: "Nostr Active", color: "default" };
    if (isNostrEnabled && nostrConnectionStatus === "connecting")
      return { status: "connected", label: "Connecting", color: "secondary" };
    if ((isP2PEnabled || isNostrEnabled) && nostrConnectionStatus === "error")
      return { status: "error", label: "Error", color: "destructive" };
    if (isP2PEnabled || isNostrEnabled)
      return { status: "enabled", label: "Ready", color: "secondary" };
    return { status: "disabled", label: "Disabled", color: "outline" };
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

      {showDetails && lastNostrSync && (
        <p className="text-xs text-muted-foreground mt-1">
          Last sync: {new Date(lastNostrSync).toLocaleString()}
        </p>
      )}
    </div>
  );
}
