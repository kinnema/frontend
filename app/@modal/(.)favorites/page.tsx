"use client";

import DialogWrapper from "@/lib/components/DialogWrapper";
import { FavoritesPageFeature } from "@/lib/features/favorites/FavoritesPage";

export default function FavoritesModal() {
  return (
    <DialogWrapper
      title="Favoriler"
      description="İzlediğiniz herşeyi kaydedin!"
    >
      <FavoritesPageFeature />
    </DialogWrapper>
  );
}
