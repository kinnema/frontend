import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWatchTogether } from "@/lib/hooks/useWatchTogether";
import { useWatchStore } from "@/lib/stores/watch.store";
import { Episode, ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useNavigate } from "@tanstack/react-router";

interface IProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  tmdbData: ITmdbSerieDetails;
  episodeData: Episode;
}

export function WatchTogether({ videoRef, ...params }: IProps) {
  const watchTogether = useWatchTogether();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { episodeData, tmdbData } = params;
  const setRoom = useWatchStore((state) => state.setRoom);
  const selectedWatchLink = useWatchStore((state) => state.selectedWatchLink);

  function createRoom() {
    async function onClickGo(roomId: string): Promise<void> {
      if (!selectedWatchLink) return;

      setRoom({
        tmdbEpisodeData: episodeData,
        tmdbData,
        roomId,
        watchLink: selectedWatchLink,
      });
      await navigate({
        to: "/room/$roomId",
        params: {
          roomId: roomId,
        },
      });
    }

    const roomId = watchTogether.createRoomId();

    toast({
      title: "Odan hazir!",
      description: "Lutfen asagidaki butona basip arkadasinizla linki paylasin",
      variant: "success",
      action: {
        label: "Git",
        onClick: () => onClickGo(roomId),
      },
    });
  }

  function onClickWatchTogether(): void {
    createRoom();
  }

  return <Button onClick={onClickWatchTogether}>Beraber izleyin!</Button>;
}
