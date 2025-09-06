import { NostrSyncDangerZone } from "@/components/settings/NostrSyncDangerZone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNostr } from "@/hooks/useNostr";
import { useNostrSync } from "@/hooks/useNostrSync";
import { AvailableCollectionForSync } from "@/lib/database/replication/availableReplications";
import { rxdbReplicationFactory } from "@/lib/database/replication/replicationFactory";
import { getDb } from "@/lib/database/rxdb";
import { useSyncStore } from "@/lib/stores/sync.store";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Globe,
  Loader2,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SyncSettingsFeature() {
  const [isExporting, setIsExporting] = useState(false);
  const isP2PEnabled = useSyncStore((state) => state.isP2PEnabled);
  const setIsP2PEnabled = useSyncStore((state) => state.setIsP2PEnabled);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState("2 minutes ago");
  const { toast } = useToast();
  const peers = useSyncStore((state) => state.peers);
  const syncId = useSyncStore((state) => state.syncId);
  const availableCollections = useSyncStore(
    (state) => state.availableCollections
  );

  // Nostr sync state
  const isNostrEnabled = useSyncStore((state) => state.isNostrEnabled);
  const setIsNostrEnabled = useSyncStore((state) => state.setIsNostrEnabled);
  const nostrId = localStorage.getItem("nostr-secret-key") || "";
  const nostrConnectionStatus = useSyncStore(
    (state) => state.nostrConnectionStatus
  );
  const setNostrConnectionStatus = useSyncStore(
    (state) => state.setNostrConnectionStatus
  );
  const nostrSyncInProgress = useSyncStore(
    (state) => state.nostrSyncInProgress
  );
  const setNostrSyncInProgress = useSyncStore(
    (state) => state.setNostrSyncInProgress
  );
  const lastNostrSync = useSyncStore((state) => state.lastNostrSync);
  const setLastNostrSync = useSyncStore((state) => state.setLastNostrSync);
  const setNostrPublicKey = useSyncStore((state) => state.setNostrPublicKey);

  // Nostr hooks
  const { isConnected: nostrConnected, publicKeyNpub } = useNostr();
  const {
    syncToNostr,
    syncFromNostr,
    fullSync,
    isSyncing: nostrSyncActive,
  } = useNostrSync();

  useEffect(() => {
    getDb();
  }, []);

  // Sync Nostr connection status with store
  useEffect(() => {
    if (nostrConnected) {
      setNostrConnectionStatus("connected");
      if (publicKeyNpub) {
        setNostrPublicKey(publicKeyNpub);
      }
    } else {
      setNostrConnectionStatus("disconnected");
    }
  }, [
    nostrConnected,
    publicKeyNpub,
    setNostrConnectionStatus,
    setNostrPublicKey,
  ]);

  // Sync Nostr sync status
  useEffect(() => {
    setNostrSyncInProgress(nostrSyncActive);
  }, [nostrSyncActive, setNostrSyncInProgress]);

  const updateCollection = async (
    key: AvailableCollectionForSync,
    enabled: boolean
  ) => {
    if (enabled) {
      console.log(`Enabling replication for ${key}`);
      await rxdbReplicationFactory.enableReplication(key);
    } else {
      await rxdbReplicationFactory.disableReplication(key);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Settings exported successfully",
        description: "Your settings have been saved to downloads folder.",
      });
    }, 2000);
  };

  const handleP2PConnect = () => {
    setIsP2PEnabled(!isP2PEnabled);
    toast({
      title: isP2PEnabled ? "Disconnected from P2P" : "Connected to P2P",
      description: isP2PEnabled
        ? "P2P sync disabled"
        : "Ready for peer-to-peer syncing",
    });
  };

  const handleNostrToggle = () => {
    setIsNostrEnabled(!isNostrEnabled);
    toast({
      title: isNostrEnabled ? "Nostr Sync Disabled" : "Nostr Sync Enabled",
      description: isNostrEnabled
        ? "Nostr synchronization has been disabled"
        : "Ready for Nostr decentralized syncing",
    });
  };

  const handleNostrSync = async (type: "push" | "pull" | "full") => {
    if (!isNostrEnabled || nostrConnectionStatus !== "connected") {
      toast({
        title: "Nostr Not Available",
        description: "Please enable Nostr sync and ensure connection is active",
        variant: "destructive",
      });
      return;
    }

    try {
      let result;
      switch (type) {
        case "push":
          result = await syncToNostr("lastWatched");
          toast({
            title: "Push to Nostr Complete",
            description: `Synced ${result.synced}/${result.total} items`,
          });
          break;
        case "pull":
          result = await syncFromNostr("lastWatched");
          toast({
            title: "Pull from Nostr Complete",
            description: `Updated ${result.updated}/${result.total} items`,
          });
          break;
        case "full":
          result = await fullSync("lastWatched");
          toast({
            title: "Full Nostr Sync Complete",
            description: `Pushed: ${result.push.synced}/${result.push.total}, Pulled: ${result.pull.updated}/${result.pull.total}`,
          });
          break;
      }
      setLastNostrSync(Date.now());
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Nostr relays",
        variant: "destructive",
      });
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);

    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setLastSyncTime("Just now");
          toast({
            title: "Sync completed",
            description: "All settings have been synchronized successfully.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground">
              Settings Sync
            </h1>
            <p className="text-muted-foreground">
              Manage your settings synchronization across devices
            </p>
          </div>
        </div>

        {/* Sync Status Panel */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isSyncing ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Sync Status
            </CardTitle>
            <CardDescription>
              Current synchronization status across your devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isSyncing
                    ? "Syncing in progress..."
                    : "All devices synchronized"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last synced: {lastSyncTime}
                </p>
              </div>
              <Badge variant={isSyncing ? "secondary" : "default"}>
                {isSyncing ? "Syncing" : "Up to date"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Sync ID (Share this ID to connect other devices)
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Input className="max-w-xs" value={syncId} readOnly />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(syncId ?? "");
                  }}
                >
                  Copy
                </Button>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Nostr ID (Share this ID to connect other devices)
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Input className="max-w-xs" value={nostrId} readOnly />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(nostrId ?? "");
                  }}
                >
                  Copy
                </Button>
              </p>
            </div>
            {isSyncing && (
              <div className="space-y-2">
                <Progress value={syncProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {syncProgress}% complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Export Functionality */}
          <Card className="opacity-20 cursor-not-allowed pointer-events-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Export Settings
              </CardTitle>
              <CardDescription>
                Download your settings as a backup file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Export all your settings to a JSON file for backup or transfer
                  to another device.
                </p>
              </div>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* P2P Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Peer-to-Peer Sync
              </CardTitle>
              <CardDescription>
                Connect directly with other devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">P2P Connection</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {isP2PEnabled ? (
                      <>
                        <Wifi className="h-3 w-3 text-green-500" />
                        Connected
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-muted-foreground" />
                        Disconnected
                      </>
                    )}
                  </p>
                </div>
                <Switch
                  checked={isP2PEnabled}
                  onCheckedChange={handleP2PConnect}
                />
              </div>
            </CardContent>
          </Card>

          {/* Nostr Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-500" />
                Nostr Sync
              </CardTitle>
              <CardDescription>
                Decentralized sync via Nostr protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nostr Connection</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {nostrConnectionStatus === "connected" ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Connected
                      </>
                    ) : nostrConnectionStatus === "connecting" ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                        Connecting
                      </>
                    ) : nostrConnectionStatus === "error" ? (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        Error
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-muted-foreground" />
                        Disconnected
                      </>
                    )}
                  </p>
                </div>
                <Switch
                  checked={isNostrEnabled}
                  onCheckedChange={handleNostrToggle}
                  disabled={nostrConnectionStatus !== "connected"}
                />
              </div>
              {isNostrEnabled && nostrConnectionStatus === "connected" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNostrSync("push")}
                      disabled={nostrSyncInProgress}
                      className="flex-1"
                    >
                      {nostrSyncInProgress ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Push"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNostrSync("pull")}
                      disabled={nostrSyncInProgress}
                      className="flex-1"
                    >
                      {nostrSyncInProgress ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Pull"
                      )}
                    </Button>
                    <Link to="/settings/sync/nostr">
                      <Button size="sm" variant="outline" className="flex-1">
                        Settings
                      </Button>
                    </Link>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleNostrSync("full")}
                    disabled={nostrSyncInProgress}
                    className="w-full"
                  >
                    {nostrSyncInProgress ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      "Full Sync"
                    )}
                  </Button>

                  {lastNostrSync && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {new Date(lastNostrSync).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <NostrSyncDangerZone />
        </div>

        {/* Settings Management */}
        <Card
          className={clsx({
            "opacity-20 cursor-not-allowed": !isP2PEnabled && !isNostrEnabled,
          })}
        >
          <CardHeader>
            <CardTitle>Sync Preferences</CardTitle>
            <CardDescription>
              Choose which settings to synchronize across devices
              {!isP2PEnabled &&
                !isNostrEnabled &&
                " (Enable P2P or Nostr sync first)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {availableCollections.map((collection) => (
                <div
                  key={collection.key}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{collection.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {collection.enabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <Switch
                    checked={collection.enabled}
                    onCheckedChange={(enabled) =>
                      updateCollection(collection.key, enabled)
                    }
                    disabled={!isP2PEnabled && !isNostrEnabled}
                  />
                </div>
              ))}
            </div>
            {(isP2PEnabled || isNostrEnabled) && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Active sync methods:
                  {isP2PEnabled && " P2P"}
                  {isP2PEnabled && isNostrEnabled && " +"}
                  {isNostrEnabled && " Nostr"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
            <CardDescription>
              Connected devices and their sync status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peers.map((peer) => (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{peer}</p>
                      <p className="text-xs text-muted-foreground">
                        Last sync: Just now
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
