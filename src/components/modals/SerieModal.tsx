import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SerieDialogFeature } from "@/lib/features/dizi/SerieDialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useNavigate } from "@tanstack/react-router";

interface SerieModalProps {
  slug: string;
  tmdbId: number;
}

export default function SerieModal({ slug, tmdbId }: SerieModalProps) {
  const navigate = useNavigate();

  const onClose = (open: boolean) => {
    if (!open) {
      navigate({ to: "/", search: {} });
    }
  };

  return (
    <Dialog open modal onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 h-[90vh] bg-black/95 text-white border-zinc-800">
        <VisuallyHidden>
          <DialogTitle>{slug}</DialogTitle>
        </VisuallyHidden>
        <SerieDialogFeature
          params={{
            slug,
            tmdbId,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
