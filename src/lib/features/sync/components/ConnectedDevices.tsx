import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { t } from "i18next";
import { Monitor, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { onlinePeers$ } from "../observables";
import { useSyncStore } from "../store";

export function ConnectedDevices() {
  const { identity } = useSyncStore();
  const navigate = useNavigate();

  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);

  useEffect(() => {
    const sub = onlinePeers$.subscribe((peer) => {
      setConnectedPeers((peers) => [...peers, ...peer]);
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const handleSetupSync = async () => {
    navigate({ to: "/settings/sync/setup" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          {t("sync.connected_devices")}
        </CardTitle>
        <CardDescription>
          {t("sync.connected_devices_description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connectedPeers && connectedPeers.length > 0 ? (
          <div className="space-y-2">
            {connectedPeers.map((peer) => (
              <div
                key={peer}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <Smartphone className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">
                    {peer || `Device ${peer}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connected via WebRTC
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {identity
                ? "No connected devices yet."
                : "Setup sync to connect multiple devices."}
            </p>
            {!identity && (
              <Button className="mt-4" onClick={handleSetupSync}>
                {t("sync.setup")}
              </Button>
            )}
          </div>
        )}
        {/* <div className="text-center py-8">
            <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              
              {identity
                ? "Device management coming soon. Your current device is configured for sync."
                : "Setup sync to connect multiple devices."}
            </p>
            {!identity && (
              <Button className="mt-4" onClick={handleSetupSync}>
                {t("sync.setup")}
              </Button>
            )}
          </div> */}
      </CardContent>
    </Card>
  );
}
