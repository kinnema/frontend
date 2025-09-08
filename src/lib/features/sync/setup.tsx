"use client";

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
import { useP2P } from "@/lib/hooks/useP2P";
import { useSyncStore } from "@/lib/stores/sync.store";
import { QrCode, RefreshCw, Shield, Smartphone, Wifi } from "lucide-react";
import { toDataURL } from "qrcode";
import { useEffect, useState } from "react";

export default function P2PSyncSetupFeature() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const { createRoomId, createRoom } = useP2P();
  const setSyncId = useSyncStore((state) => state.setSyncId);
  const syncId = useSyncStore((state) => state.syncId);

  useEffect(() => {
    if (!qrCodeData) {
      generateQRCode();
    }

    const interval = setInterval(() => {
      generateQRCode();
    }, 300_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  function generateRoomId() {
    const id = createRoomId();
    setSyncId(id);

    return id;
  }

  async function generateQRCode() {
    try {
      setIsGenerating(true);
      const id = generateRoomId();

      if (!id) {
        throw new Error("Failed to generate room ID");
      }
      
      const qrCode = await toDataURL(id);

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
      await generateQRCode();
    } catch (error) {
      console.error("Failed to regenerate QR code:", error);
      // Could add toast notification here if needed
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
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

        {/* QR Code Card */}
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
            {/* QR Code Placeholder */}
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
                value={syncId}
                readOnly
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(syncId ?? "");
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

        {/* Action Buttons */}
        <div className="flex gap-3">
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
          <Button variant="secondary" className="flex-1">
            Cancel Setup
          </Button>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            End-to-end encrypted
          </Badge>
        </div>

        {/* Help Text */}
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
