"use client";

import { SerieDialogFeature } from "@/lib/features/dizi/SerieDialog";

export default function SeriePage({ params }: { params: { slug: string } }) {
  return <SerieDialogFeature params={params} />;
}
