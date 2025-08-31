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
import { AvailableCollectionForSync } from "@/lib/database/replication/availableReplications";
import { rxdbReplicationFactory } from "@/lib/database/replication/replicationFactory";
import { getDb } from "@/lib/database/rxdb";
import { useSyncStore } from "@/lib/stores/sync.store";
import clsx from "clsx";
import {
  CheckCircle,
  Clock,
  Download,
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

  useEffect(() => {
    getDb();
  }, []);

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

        <div className="grid gap-6 md:grid-cols-2">
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
        </div>

        {/* Settings Management */}
        <Card
          className={clsx({ "opacity-20 cursor-not-allowed": !isP2PEnabled })}
        >
          <CardHeader>
            <CardTitle>Sync Preferences</CardTitle>
            <CardDescription>
              Choose which settings to synchronize across devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {availableCollections.map((collection) => (
                <div className="flex items-center justify-between">
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
                  />
                </div>
              ))}
            </div>
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
