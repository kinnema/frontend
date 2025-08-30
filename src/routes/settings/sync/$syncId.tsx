import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useP2P } from "@/lib/hooks/useP2P";
import { useSyncStore } from "@/lib/stores/sync.store";
import { p2pEventEmitter } from "@/lib/utils/p2pEvents";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/settings/sync/$syncId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { syncId: syncIdFromUrl } = Route.useParams();
  const { createRoom, joinRoom } = useP2P();
  const setSyncId = useSyncStore((state) => state.setSyncId);
  const syncId = useSyncStore((state) => state.syncId);
  const [manualSyncId, setManualSyncId] = useState("");
  const setSetup = useSyncStore((state) => state.setSetup);

  // Set syncId from URL on component mount
  useEffect(() => {
    // The route can be /settings/sync/setup, so we check for that
    if (syncIdFromUrl && syncIdFromUrl !== "setup") {
      setSyncId(syncIdFromUrl);
    }
  }, [syncIdFromUrl, setSyncId]);

  // Join room when syncId is available
  useEffect(() => {
    if (!syncId) return;

    const { getAction } = createRoom(syncId);

    getAction((data: unknown) => {
      console.log("Data received from peer:", data);
    });

    p2pEventEmitter.addListener("status", (status) => {
      switch (status) {
        case "JOINED":
          setSetup(true);
          break;

        default:
          break;
      }
    });

    // We can also send a message back
    // const { sendAction } = createRoom(syncId);
    // sendAction({ status: "connected" });
  }, [syncId, createRoom]);

  const handleJoinManually = () => {
    if (manualSyncId) {
      setSyncId(manualSyncId);
    }
  };

  return (
    <div className="p-4 flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Sync Session</CardTitle>
          <CardDescription>
            Joining a peer-to-peer sync session. The sync ID should be provided
            in the URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Sync ID from URL</Label>
            <Input value={syncIdFromUrl} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Current Sync ID</Label>
            <Input value={syncId ?? "Not set"} readOnly />
          </div>

          <div className="pt-4 space-y-2">
            <Label htmlFor="manual-sync-id">Debug: Manual Sync ID</Label>
            <div className="flex gap-2">
              <Input
                id="manual-sync-id"
                value={manualSyncId}
                onChange={(e) => setManualSyncId(e.target.value)}
                placeholder="Enter sync ID manually"
              />
              <Button onClick={handleJoinManually}>Join</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this to manually join a room for debugging purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
