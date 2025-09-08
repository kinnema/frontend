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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNostr } from "@/hooks/useNostr";
import { NostrIdInput } from "@/lib/components/NostrId";
import { AvailableCollectionForSync } from "@/lib/database/replication/availableReplications";
import { rxdbReplicationFactory } from "@/lib/database/replication/replicationFactory";
import { getDb } from "@/lib/database/rxdb";
import { useSyncStore } from "@/lib/stores/sync.store";
import { SYNC_CONNECTION_STATUS } from "@/lib/types/sync.type";
import clsx from "clsx";
import { CheckCircle, Clock, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NostrSyncComponent } from "./components/nostrSync.component";
import { P2PSyncComponent } from "./components/p2pSync.component";

export default function SyncSettingsFeature() {
  const lastSyncTime = useSyncStore((state) => state.lastNostrSync);
  const [isExporting, setIsExporting] = useState(false);
  const isP2PEnabled = useSyncStore((state) => state.isP2PEnabled);
  const isSyncing = useSyncStore((state) => state.nostrSyncInProgress);
  const { toast } = useToast();
  const { t } = useTranslation();
  const peers = useSyncStore((state) => state.peers);
  const syncId = useSyncStore((state) => state.syncId);
  const availableCollections = useSyncStore(
    (state) => state.availableCollections
  );
  const isNostrEnabled = useSyncStore((state) => state.isNostrEnabled);

  const setNostrConnectionStatus = useSyncStore(
    (state) => state.setNostrConnectionStatus
  );
  const setNostrPublicKey = useSyncStore((state) => state.setNostrPublicKey);

  // Nostr hooks
  const { isConnected: nostrConnected, publicKeyNpub } = useNostr();

  useEffect(() => {
    getDb();
  }, []);

  // Sync Nostr connection status with store
  useEffect(() => {
    if (nostrConnected) {
      setNostrConnectionStatus(SYNC_CONNECTION_STATUS.CONNECTED);
      if (publicKeyNpub) {
        setNostrPublicKey(publicKeyNpub);
      }
    } else {
      setNostrConnectionStatus(SYNC_CONNECTION_STATUS.DISCONNECTED);
    }
  }, [
    nostrConnected,
    publicKeyNpub,
    setNostrConnectionStatus,
    setNostrPublicKey,
  ]);

  const updateCollection = async (
    key: AvailableCollectionForSync,
    enabled: boolean
  ) => {
    try {
      const type =
        isP2PEnabled && isNostrEnabled
          ? "all"
          : isP2PEnabled
          ? "webrtc"
          : isNostrEnabled
          ? "nostr"
          : "all";
      
      if (enabled) {
        console.log(`Enabling replication for ${key}`);
        await rxdbReplicationFactory.enableReplication(key, type);
        toast({
          title: t("sync.success"),
          description: t("sync.replicationEnabled", { collection: key }),
        });
      } else {
        console.log(`Disabling replication for ${key}`);
        await rxdbReplicationFactory.disableReplication(key, type);
        toast({
          title: t("sync.success"),
          description: t("sync.replicationDisabled", { collection: key }),
        });
      }
    } catch (error) {
      console.error(`Error updating collection ${key}:`, error);
      toast({
        title: t("sync.error"),
        description: t("sync.replicationError", { 
          collection: key, 
          error: error instanceof Error ? error.message : "Unknown error"
        }),
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // TODO: Implement actual export logic
      // Simulate export process for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: t("sync.toast.exportSuccess"),
        description: t("sync.toast.exportSuccessDescription"),
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t("sync.toast.exportError"),
        description: t("sync.toast.exportErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
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
                  {t("sync.lastSynced")}:
                  {new Date(lastSyncTime ?? 0).toLocaleString()}
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
          <P2PSyncComponent />

          {/* Nostr Sync */}
          <NostrSyncComponent />
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
                    onCheckedChange={(enabled) => {
                      updateCollection(collection.key, enabled);
                    }}
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
