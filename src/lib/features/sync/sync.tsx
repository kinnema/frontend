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
import { NostrIdInput } from "@/lib/components/NostrId";
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
import { useTranslation } from "react-i18next";

export default function SyncSettingsFeature() {
  const [isExporting, setIsExporting] = useState(false);
  const isP2PEnabled = useSyncStore((state) => state.isP2PEnabled);
  const setIsP2PEnabled = useSyncStore((state) => state.setIsP2PEnabled);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState("2 minutes ago");
  const { toast } = useToast();
  const { t } = useTranslation();
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
        title: t("sync.toast.exportSuccess"),
        description: t("sync.toast.exportSuccessDescription"),
      });
    }, 2000);
  };

  const handleP2PConnect = () => {
    setIsP2PEnabled(!isP2PEnabled);
    toast({
      title: isP2PEnabled
        ? t("sync.toast.p2pDisconnected")
        : t("sync.toast.p2pConnected"),
      description: isP2PEnabled
        ? t("sync.toast.p2pDisabled")
        : t("sync.toast.p2pReady"),
    });
  };

  const handleNostrToggle = () => {
    setIsNostrEnabled(!isNostrEnabled);
    toast({
      title: isNostrEnabled
        ? t("sync.toast.nostrDisabled")
        : t("sync.toast.nostrEnabled"),
      description: isNostrEnabled
        ? t("sync.toast.nostrDisabledDescription")
        : t("sync.toast.nostrReady"),
    });
  };

  const handleNostrSync = async (type: "push" | "pull" | "full") => {
    if (!isNostrEnabled || nostrConnectionStatus !== "connected") {
      toast({
        title: t("sync.toast.nostrNotAvailable"),
        description: t("sync.toast.nostrNotAvailableDescription"),
        variant: "destructive",
      });
      return;
    }

    for (const collection of availableCollections) {
      if (!collection.enabled) {
        return;
      }

      try {
        let result;
        switch (type) {
          case "push":
            result = await syncToNostr(collection.key);
            toast({
              title: t("sync.toast.pushComplete"),
              description: t("sync.toast.pushDescription", {
                synced: result.synced,
                total: result.total,
              }),
            });
            break;
          case "pull":
            result = await syncFromNostr(collection.key);
            toast({
              title: t("sync.toast.pullComplete"),
              description: t("sync.toast.pullDescription", {
                updated: result.updated,
                total: result.total,
              }),
            });
            break;
          case "full":
            result = await fullSync(collection.key);
            toast({
              title: t("sync.toast.fullSyncComplete"),
              description: t("sync.toast.fullSyncDescription", {
                pushSynced: result.push.synced,
                pushTotal: result.push.total,
                pullUpdated: result.pull.updated,
                pullTotal: result.pull.total,
              }),
            });
            break;
        }
        setLastNostrSync(Date.now());
      } catch (error) {
        toast({
          title: t("sync.toast.syncFailed"),
          description: t("sync.toast.syncFailedDescription"),
          variant: "destructive",
        });
      }
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
            title: t("sync.toast.syncCompleted"),
            description: t("sync.toast.syncCompletedDescription"),
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
              {t("sync.title")}
            </h1>
            <p className="text-muted-foreground">{t("sync.description")}</p>
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
              {t("sync.syncStatus")}
            </CardTitle>
            <CardDescription>{t("sync.syncStatusDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isSyncing
                    ? t("sync.syncingInProgress")
                    : t("sync.allDevicesSynchronized")}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t("sync.lastSynced")}: {lastSyncTime}
                </p>
              </div>
              <Badge variant={isSyncing ? "secondary" : "default"}>
                {isSyncing ? t("sync.syncing") : t("sync.upToDate")}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("sync.syncIdLabel")}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Input className="max-w-xs" value={syncId} readOnly />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(syncId ?? "");
                  }}
                >
                  {t("sync.copy")}
                </Button>
              </p>
            </div>
            <NostrIdInput />
            {isSyncing && (
              <div className="space-y-2">
                <Progress value={syncProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {syncProgress}
                  {t("sync.progressComplete")}
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
                {t("sync.exportSettings")}
              </CardTitle>
              <CardDescription>{t("sync.exportDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t("sync.exportDetails")}
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
                    {t("sync.exporting")}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t("sync.exportSettings")}
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
                {t("sync.peerToPeerSync")}
              </CardTitle>
              <CardDescription>{t("sync.p2pDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {t("sync.p2pConnection")}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {isP2PEnabled ? (
                      <>
                        <Wifi className="h-3 w-3 text-green-500" />
                        {t("sync.connected")}
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-muted-foreground" />
                        {t("sync.disconnected")}
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
                {t("sync.nostrSync")}
              </CardTitle>
              <CardDescription>{t("sync.nostrDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {t("sync.nostrConnection")}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {nostrConnectionStatus === "connected" ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {t("sync.connected")}
                      </>
                    ) : nostrConnectionStatus === "connecting" ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                        {t("sync.connecting")}
                      </>
                    ) : nostrConnectionStatus === "error" ? (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        {t("sync.error")}
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-muted-foreground" />
                        {t("sync.disconnected")}
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
                        t("sync.push")
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
                        t("sync.pull")
                      )}
                    </Button>
                    <Link to="/settings/sync/nostr">
                      <Button size="sm" variant="outline" className="flex-1">
                        {t("sync.settings")}
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
                        {t("sync.syncingButton")}
                      </>
                    ) : (
                      t("sync.fullSync")
                    )}
                  </Button>

                  {lastNostrSync && (
                    <p className="text-xs text-muted-foreground">
                      {t("sync.lastSync")}:{" "}
                      {new Date(lastNostrSync).toLocaleString()}
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
            <CardTitle>{t("sync.syncPreferences")}</CardTitle>
            <CardDescription>
              {t("sync.syncPreferencesDescription")}
              {!isP2PEnabled && !isNostrEnabled && t("sync.enableSyncFirst")}
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
                      {collection.enabled
                        ? t("sync.enabled")
                        : t("sync.disabled")}
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
                  {t("sync.activeSyncMethods")}
                  {isP2PEnabled && ` ${t("sync.p2p")}`}
                  {isP2PEnabled && isNostrEnabled && ` ${t("sync.plus")}`}
                  {isNostrEnabled && ` ${t("sync.nostr")}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sync.deviceStatus")}</CardTitle>
            <CardDescription>
              {t("sync.deviceStatusDescription")}
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
                        {t("sync.lastSyncJustNow")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">{t("sync.active")}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
