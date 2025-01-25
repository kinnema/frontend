import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SerieDialogFeature } from "@/lib/features/dizi/SerieDialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default async function Page(props: {
  params: Promise<{ slug: string; tmdbId: number }>;
}) {
  const params = await props.params;

  return (
    <Dialog open={true} modal defaultOpen>
      <DialogContent className="max-w-6xl p-0 h-[90vh] bg-black/95 text-white border-zinc-800">
        <VisuallyHidden>
          <DialogTitle>{params.slug}</DialogTitle>
        </VisuallyHidden>
        <SerieDialogFeature params={params} isClient />
      </DialogContent>
    </Dialog>
  );
}
