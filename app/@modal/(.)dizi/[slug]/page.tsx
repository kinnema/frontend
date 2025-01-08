import { SerieDialogFeature } from "@/lib/features/dizi/SerieDialog";

export default function Page({ params }: { params: { slug: string } }) {
  return <SerieDialogFeature params={params} />;
}
