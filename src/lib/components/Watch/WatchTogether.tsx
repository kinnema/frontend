import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useP2P } from "@/lib/hooks/useP2P";
import { useNavigate } from "@tanstack/react-router";

interface IProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  slug: string;
  season: number;
  chapter: number;
  tmdbId: number;
}

export function WatchTogether({ videoRef, ...params }: IProps) {
  const p2p = useP2P();
  const { toast } = useToast();
  const navigate = useNavigate();

  function createRoom() {
    async function onClickGo(roomId: string): Promise<void> {
      navigate({
        to: "/room/$roomId",
        params: {
          roomId: roomId,
        },
        search: {
          chapter: params.chapter,
          season: params.season,
          slug: params.slug,
          tmdbId: params.tmdbId,
          created: true,
        },
      });
    }

    const roomId = p2p.createRoomId();

    toast({
      title: "Odan hazir!",
      description: "Lutfen asagidaki butona basip arkadasinizla linki paylasin",
      action: (
        <ToastAction altText="share" onClick={() => onClickGo(roomId)}>
          Git
        </ToastAction>
      ),
    });
  }

  function onClickWatchTogether(): void {
    createRoom();
  }

  return <Button onClick={onClickWatchTogether}>Beraber izleyin!</Button>;
}
