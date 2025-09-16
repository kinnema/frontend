import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useNostr } from "@/hooks/useNostr";
import { useNostrSync } from "@/hooks/useNostrSync";
import { useSyncStore } from "@/lib/stores/sync.store";
import { SYNC_CONNECTION_STATUS } from "@/lib/types/sync.type";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  Globe,
  Loader2,
  WifiOff,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function NostrSyncComponent() {
  const { isConnected: nostrConnected, publicKeyNpub } = useNostr();

  const { syncToNostr, syncFromNostr, fullSync } = useNostrSync();
  const setIsNostrEnabled = useSyncStore((state) => state.setIsNostrEnabled);
  const availableCollections = useSyncStore(
    (state) => state.availableCollections
  );
  const lastNostrSync = useSyncStore((state) => state.lastNostrSync);
  const setLastNostrSync = useSyncStore((state) => state.setLastNostrSync);
  const { t } = useTranslation();

  const setNostrConnectionStatus = useSyncStore(
    (state) => state.setNostrConnectionStatus
  );
  const setNostrPublicKey = useSyncStore((state) => state.setNostrPublicKey);

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

  const isNostrEnabled = useSyncStore((state) => state.isNostrEnabled);
  const nostrConnectionStatus = useSyncStore(
    (state) => state.nostrConnectionStatus
  );
  const nostrSyncInProgress = useSyncStore(
    (state) => state.nostrSyncInProgress
  );

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
        switch (type) {
          case "push":
            syncToNostr();

            break;
          case "pull":
            syncFromNostr();

            break;
          case "full":
            await fullSync();

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

  return (
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
            <p className="text-sm font-medium">{t("sync.nostrConnection")}</p>
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
                {t("sync.lastSync")}: {new Date(lastNostrSync).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
