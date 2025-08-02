import { getDb } from "@/lib/database/rxdb";
import { FavoritesPageFeature } from "@/lib/features/favorites/FavoritesPage";
import { QUERY_KEYS } from "@/lib/utils/queryKeys";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/favorites")({
  codeSplitGroupings: [["component", "loader"]],
  async loader(ctx) {
    const db = await getDb();
    const query = db.favorite.find();

    const data = await ctx.context.queryClient.ensureQueryData({
      queryKey: QUERY_KEYS.Favorites,
      queryFn: async () => await query.exec(),
    });

    return data;
  },
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
