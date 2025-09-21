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
import { Label } from "@/components/ui/label";
import { useSyncStore } from "@/lib/features/sync/store";
import { useNavigate } from "@tanstack/react-router";
import { Key, QrCode, RefreshCw, Shield, Smartphone, Wifi } from "lucide-react";
import { toDataURL } from "qrcode";
import { useEffect, useState } from "react";

export default function SyncSetupFeature() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [isImportMode, setIsImportMode] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState("");
  const setSyncId = useSyncStore((state) => state.setIdentity);
  const syncId = useSyncStore((state) => state.identity);
  const generateIdentity = useSyncStore((state) => state.generateIdentity);
  const clearIdentity = useSyncStore((state) => state.clearIdentity);
  const navigate = useNavigate();

  useEffect(() => {
    if (syncId) {
      generateQRCode();
    } else {
      generateIdentity();
    }
  }, [syncId]);

  async function generateQRCode() {
    try {
      setIsGenerating(true);
      if (!syncId) {
        throw new Error("Sync ID is not available");
      }

      const qrCode = await toDataURL(syncId?.mnemonic ?? "");

      setQrCodeData(qrCode);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      // Could add toast notification here if needed
    } finally {
      setIsGenerating(false);
    }
  }

  const handleRegenerateQR = async () => {
    try {
      await generateIdentity();
      await generateQRCode();
    } catch (error) {
      console.error("Failed to regenerate QR code:", error);
      // Could add toast notification here if needed
    }
  };

  const handleImportMnemonic = async () => {
    if (!importMnemonic.trim()) return;

    try {
      await setSyncId(importMnemonic.trim());
      setIsImportMode(false);
      setImportMnemonic("");
      await generateQRCode();
    } catch (error) {
      console.error("Failed to import mnemonic:", error);
      // Could add toast notification here if needed
    }
  };

  function cancelSetup() {
    clearIdentity();
    return navigate({
      to: "/",
      from: "/settings/sync/setup",
    });
  }

  function continueSetup() {
    return navigate({
      to: "/settings/sync",
      from: "/settings/sync/setup",
    });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Wifi className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Sync Your Devices
          </h1>
          <p className="text-muted-foreground text-balance">
            Scan the QR code with your other device to establish a secure
            peer-to-peer connection
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            variant={isImportMode ? "outline" : "default"}
            onClick={() => setIsImportMode(false)}
            className="rounded-r-none"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Generate New
          </Button>
          <Button
            variant={isImportMode ? "default" : "outline"}
            onClick={() => setIsImportMode(true)}
            className="rounded-l-none"
          >
            <Key className="h-4 w-4 mr-2" />
            Import Existing
          </Button>
        </div>

        {isImportMode ? (
          <Card className="border-2 border-dashed border-border">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Key className="h-5 w-5" />
                Import Mnemonic Key
              </CardTitle>
              <CardDescription>
                Paste your existing mnemonic key to sync with your other devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mnemonic">Mnemonic Key</Label>
                <Input
                  id="mnemonic"
                  placeholder="Enter your 12-word mnemonic key..."
                  value={importMnemonic}
                  onChange={(e) => setImportMnemonic(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleImportMnemonic}
                disabled={!importMnemonic.trim()}
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                Import & Generate QR
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed border-border">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5" />
                Connection Code
              </CardTitle>
              <CardDescription>
                This code expires in 5 minutes for security
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {qrCodeData && (
                <img
                  src={qrCodeData}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              )}

              <Label className="text-sm text-muted-foreground">
                Or use the following code
              </Label>

              <div className="flex items-center gap-2">
                <Input
                  className=" max-w-full overflow-auto"
                  value={syncId?.mnemonic ?? ""}
                  readOnly
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(syncId?.mnemonic ?? "");
                  }}
                >
                  Copy
                </Button>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Open the app on your other device and scan this code
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span>Works with phones, tablets, and computers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          {!isImportMode && (
            <Button
              onClick={handleRegenerateQR}
              disabled={isGenerating}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Code
                </>
              )}
            </Button>
          )}
          <Button
            variant="default"
            className="flex-1"
            onClick={() => continueSetup()}
            disabled={!syncId}
          >
            Continue
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => cancelSetup()}
          >
            Cancel Setup
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            End-to-end encrypted
          </Badge>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Having trouble? Make sure both devices are connected to the internet
            and the app is updated to the latest version.
          </p>
        </div>
      </div>
    </div>
  );
}
