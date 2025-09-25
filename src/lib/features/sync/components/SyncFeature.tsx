import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { getDb } from "@/lib/database/rxdb";
import { useSyncStore } from "@/lib/features/sync/store";
import { ConnectionStatus } from "@/lib/features/sync/types";
import { useNavigate } from "@tanstack/react-router";
import { Activity, Globe, Settings, Shield, Wifi, WifiOff } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ConnectedDevices } from "./ConnectedDevices";
import SyncRelaySettingsConfigurator from "./SyncRelaySettingsConfigurator";

export default function SyncFeature() {
  const navigate = useNavigate();
  const {
    identity,
    collections,
    nostrStatus,
    webrtcStatus,
    isActive,
    setActive,
    updateCollectionConfig,
    clearIdentity,
  } = useSyncStore();

  const { t } = useTranslation();
  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return "bg-green-500";
      case ConnectionStatus.CONNECTING:
        return "bg-yellow-500";
      case ConnectionStatus.IDLE:
        return "bg-yellow-500";
      case ConnectionStatus.ERROR:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  useEffect(() => {
    getDb();
  }, []);

  const handleSetupSync = async () => {
    navigate({ to: "/settings/sync/setup" });
  };

  const handleDisableSync = () => {
    clearIdentity();
    setActive(false);
  };

  const handleCopyKey = () => {
    if (identity) {
      navigator.clipboard.writeText(identity.mnemonic);
      toast({
        title: t("sync.key_copied"),
        description: t("sync.key_copied_description"),
        variant: "success",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("sync.settings")}
          </h1>
          <p className="text-muted-foreground">
            {t("sync.settings_description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {isActive ? (
              <Activity className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t("sync.status")}
          </CardTitle>
          <CardDescription>{t("sync.status_description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">{t("sync.enable")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("sync.enable_description")}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setActive}
              disabled={!identity}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(
                  nostrStatus
                )}`}
              />
              <div>
                <p className="text-sm font-medium">{t("sync.nostr_network")}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {nostrStatus}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(
                  webrtcStatus
                )}`}
              />
              <div>
                <p className="text-sm font-medium">{t("sync.webrtc")}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {webrtcStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("sync.identity")}</p>
                  <p className="text-xs text-muted-foreground">
                    {identity
                      ? `Device ID: ${identity.deviceId.substring(0, 8)}...`
                      : "Not configured"}
                  </p>
                </div>
              </div>
              {!identity ? (
                <Button size="sm" onClick={handleSetupSync}>
                  {t("sync.setup")}
                </Button>
              ) : (
                <div className="flex gap-5">
                  <Button size="sm" variant="outline" onClick={handleCopyKey}>
                    {t("sync.copy")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDisableSync}
                  >
                    {t("sync.reset")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("sync.data_collections")}
          </CardTitle>
          <CardDescription>
            {t("sync.data_collections_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {collections.map((collection) => (
            <div key={collection.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium capitalize">
                    {collection.name.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("sync.data_collections_description", {
                      collection: collection.name
                        .replace(/([A-Z])/g, " $1")
                        .trim(),
                    })}
                  </p>
                </div>
                <Switch
                  checked={collection.enabled}
                  onCheckedChange={(enabled) =>
                    updateCollectionConfig(collection.name, { enabled })
                  }
                />
              </div>

              {collection.enabled && (
                <div className="ml-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {t("sync.nostr_network")}
                    </Label>
                    <Switch
                      checked={collection.nostrEnabled}
                      onCheckedChange={(nostrEnabled) =>
                        updateCollectionConfig(collection.name, {
                          nostrEnabled,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wifi className="h-3 w-3" />
                      {t("sync.webrtc")}
                    </Label>
                    <Switch
                      checked={collection.webrtcEnabled}
                      onCheckedChange={(webrtcEnabled) =>
                        updateCollectionConfig(collection.name, {
                          webrtcEnabled,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <SyncRelaySettingsConfigurator />

      <ConnectedDevices />
    </div>
  );
}
