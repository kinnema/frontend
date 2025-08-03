import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useP2P } from "@/lib/hooks/useP2P";
import { Log } from "@/lib/utils/log";
import { Share } from "@capacitor/share";
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

interface IProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function WatchTogether({ videoRef }: IProps) {
  const p2p = useP2P({ videoRef });
  const { toast } = useToast();
  const router = useRouterState();

  useEffect(() => {
    if (router.location.search.watchRoomId !== undefined) {
      p2p.joinRoom(router.location.search.watchRoomId as string);
    }
  }, []);

  function _createUrl(roomId: string) {
    const currentParams = router.location.search as Record<
      string,
      string | undefined | null
    >;
    const paramsWithRoom = { ...currentParams, watchRoomId: roomId };

    const searchParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(paramsWithRoom).filter(([, value]) => value != null)
      ) as Record<string, string>
    );
    const url = `${window.location.origin}/?${searchParams.toString()}`;

    return url;
  }

  function createRoom() {
    async function onClickShare(url: string): Promise<void> {
      Log.add("onClickShare " + url);
      const canShare = await Share.canShare();

      if (canShare.value) {
        Share.share({
          url,
          title: "Hadi gel beraber izleyelim!",
          dialogTitle: "Hadi gel beraber izleyelim!",
        });
      } else {
        toast({
          title: "Kopyaladim!",
          description: "URL Kopyalandi!",
        });
        window.navigator.clipboard.writeText(url);
      }
    }

    const roomId = p2p.createRoom();
    const url = _createUrl(roomId);

    toast({
      title: "Odan hazir!",
      description: "Lutfen asagidaki butona basip arkadasinizla linki paylasin",
      action: (
        <ToastAction altText="share" onClick={() => onClickShare(url)}>
          Paylaş
        </ToastAction>
      ),
    });
  }

  function onClickWatchTogether(): void {
    createRoom();
  }

  return <Button onClick={onClickWatchTogether}>Beraber izleyin!</Button>;
}
