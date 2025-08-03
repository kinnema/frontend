import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import WatchPageFeature from "@/lib/features/watch/WatchPage";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

interface WatchModalProps {
  slug: string;
  tmdbId: number;
  season: number;
  chapter: number;
}

export function WatchModal({ slug, tmdbId, season, chapter }: WatchModalProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const onClose = (open: boolean) => {
    if (!open) {
      navigate({ to: "/", search: {} });
    }
  };

  return (
    <Dialog open modal onOpenChange={onClose}>
      <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 bg-black border-none">
        <VisuallyHidden>
          <DialogTitle>
            {slug} - Season {season} Episode {chapter}
          </DialogTitle>
        </VisuallyHidden>
        <WatchPageFeature
          params={{
            slug,
            tmdbId,
            season,
            chapter,
            isInRoom: false,
            videoRef,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
