import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSyncStore } from "@/lib/stores/sync.store";
import { t } from "i18next";
import { Users, Wifi, WifiOff } from "lucide-react";

export function P2PSyncComponent() {
  const { toast } = useToast();
  const isP2PEnabled = useSyncStore((state) => state.isP2PEnabled);
  const setIsP2PEnabled = useSyncStore((state) => state.setIsP2PEnabled);

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
  return (
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
            <p className="text-sm font-medium">{t("sync.p2pConnection")}</p>
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
          <Switch checked={isP2PEnabled} onCheckedChange={handleP2PConnect} />
        </div>
      </CardContent>
    </Card>
  );
}
