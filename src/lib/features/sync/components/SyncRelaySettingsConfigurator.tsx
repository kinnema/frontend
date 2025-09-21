import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSyncStore } from "@/lib/features/sync/store";
import { ConnectionStatus } from "@/lib/features/sync/types";
import {
  CheckCircle,
  Globe,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function SyncRelaySettingsConfigurator() {
  const { nostrRelays, addRelay, removeRelay } = useSyncStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRelayUrl, setNewRelayUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ConnectionStatus.CONNECTING:
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case ConnectionStatus.ERROR:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return "text-green-600";
      case ConnectionStatus.CONNECTING:
        return "text-yellow-600";
      case ConnectionStatus.ERROR:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const validateRelayUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "wss:" || parsedUrl.protocol === "ws:";
    } catch {
      return false;
    }
  };

  const handleAddRelay = () => {
    const trimmedUrl = newRelayUrl.trim();
    if (!validateRelayUrl(trimmedUrl)) {
      setIsValidUrl(false);
      return;
    }

    // Check if relay already exists
    if (nostrRelays.some((relay) => relay.url === trimmedUrl)) {
      setIsValidUrl(false);
      return;
    }

    addRelay(trimmedUrl);
    setNewRelayUrl("");
    setIsValidUrl(true);
    setIsAddDialogOpen(false);
  };

  const handleRemoveRelay = (url: string) => {
    removeRelay(url);
  };

  const handleUrlChange = (value: string) => {
    setNewRelayUrl(value);
    if (!isValidUrl) {
      setIsValidUrl(validateRelayUrl(value.trim()));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Nostr Relays
            </CardTitle>
            <CardDescription>
              Configure relay servers for synchronization
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Relay
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Relay</DialogTitle>
                <DialogDescription>
                  Enter the WebSocket URL of the Nostr relay you want to add.
                  The URL should start with wss:// or ws://
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="relay-url">Relay URL</Label>
                  <Input
                    id="relay-url"
                    placeholder="wss://relay.example.com"
                    value={newRelayUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={!isValidUrl ? "border-red-500" : ""}
                  />
                  {!isValidUrl && (
                    <p className="text-sm text-red-500 mt-1">
                      Please enter a valid WebSocket URL (wss:// or ws://)
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setNewRelayUrl("");
                    setIsValidUrl(true);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddRelay} disabled={!newRelayUrl.trim()}>
                  Add Relay
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {nostrRelays.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No relays configured. Add a relay to start synchronizing data.
              </p>
            </div>
          ) : (
            nostrRelays.map((relay, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(relay.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{relay.url}</p>
                    <p
                      className={`text-xs capitalize ${getStatusColor(
                        relay.status
                      )}`}
                    >
                      {relay.status}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRelay(relay.url)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {nostrRelays.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Changes to relay configuration will take
              effect the next time sync is restarted. Some relays may have rate
              limits or require authentication.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
