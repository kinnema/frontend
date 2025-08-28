import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Settings,
  Upload,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings/sync")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isExporting, setIsExporting] = useState(false);
  const [isP2PConnected, setIsP2PConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState("2 minutes ago");
  const { toast } = useToast();

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
    setIsP2PConnected(!isP2PConnected);
    toast({
      title: isP2PConnected ? "Disconnected from P2P" : "Connected to P2P",
      description: isP2PConnected
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
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-muted-foreground" />
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
          <Card>
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
                    {isP2PConnected ? (
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
                  checked={isP2PConnected}
                  onCheckedChange={handleP2PConnect}
                />
              </div>

              <Button
                onClick={handleSync}
                disabled={!isP2PConnected || isSyncing}
                variant="secondary"
                className="w-full"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Management */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Preferences</CardTitle>
            <CardDescription>
              Choose which settings to synchronize across devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Theme & Appearance</p>
                  <p className="text-xs text-muted-foreground">
                    Dark mode, colors, layout
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Alert preferences, sounds
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Privacy Settings</p>
                  <p className="text-xs text-muted-foreground">
                    Data sharing, analytics
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Keyboard Shortcuts</p>
                  <p className="text-xs text-muted-foreground">
                    Custom key bindings
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
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
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">MacBook Pro</p>
                    <p className="text-xs text-muted-foreground">
                      Last sync: Just now
                    </p>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">iPhone 15</p>
                    <p className="text-xs text-muted-foreground">
                      Last sync: 5 minutes ago
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">iPad Air</p>
                    <p className="text-xs text-muted-foreground">
                      Last sync: 2 hours ago
                    </p>
                  </div>
                </div>
                <Badge variant="destructive">Error</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
