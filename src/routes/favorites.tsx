import { FavoritesPageFeature } from "@/lib/features/favorites/FavoritesPage";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/favorites")({
  codeSplitGroupings: [["component"]],
  component: () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Favoriler</h1>
      <p className="text-gray-400 mb-6">İzlediğiniz herşeyi kaydedin!</p>
      <Suspense>
        <FavoritesPageFeature />
      </Suspense>
    </div>
  ),
});
