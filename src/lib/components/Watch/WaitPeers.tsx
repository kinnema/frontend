import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { share } from "@/lib/utils/share";
import { Check, Loader2, Share2 } from "lucide-react";
import { useState } from "react";

export function WaitPeers({ roomId }: { roomId: string }) {
  const roomUrl = _createUrl(roomId);

  function _createUrl(roomId: string) {
    const url = `${window.location.origin}/room/${roomId}`;

    return url;
  }

  async function handleCopy() {
    const url = _createUrl(roomId);

    await share({
      url,
      title: "Hadi gel beraber izleyelim!",
      dialogTitle: "Hadi gel beraber izleyelim!",
    });

    setCopied(true);
  }

  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Odaya katiliyor</CardTitle>
          <CardDescription>Lutfen odaya baglanirken bekleyiniz</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Diger esler bekleniyor...</p>
          <p className="text-sm text-muted-foreground">
            Bu biraz zaman alabilir, lutfen pencereyi kapatmayin.
          </p>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              value={roomUrl}
              readOnly
              className="flex-1"
              aria-label="Oda URL"
            />
            <Button
              onClick={handleCopy}
              className="shrink-0"
              aria-label="Oda URL'sini kopyala"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              <span>{copied ? "Kopyalandi!" : "Paylas"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
