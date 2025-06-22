"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SerieDialogFeature } from "@/lib/features/dizi/SerieDialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useParams } from "next/navigation";

export default function Page() {
  const { slug, tmdbId } = useParams<{ slug: string; tmdbId: string }>();

  return (
    <Dialog open modal defaultOpen>
      <DialogContent className="max-w-6xl p-0 h-[90vh] bg-black/95 text-white border-zinc-800">
        <VisuallyHidden>
          <DialogTitle>{slug}</DialogTitle>
        </VisuallyHidden>
        <SerieDialogFeature
          params={{
            slug,
            tmdbId: parseInt(tmdbId),
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
