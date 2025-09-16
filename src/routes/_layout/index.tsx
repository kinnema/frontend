import { HomeFeature } from "@/lib/features/home/HomeFeature";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { lazy, Suspense } from "react";
import z from "zod";

const SerieModal = lazy(() => import("@/components/modals/SerieModal"));
const WatchModal = lazy(() => import("@/components/modals/WatchModal"));
const FavoritesModal = lazy(() => import("@/components/modals/FavoritesModal"));

const modalSearchSchema = z.object({
  modal: z.optional(
    z.enum(["login", "register", "favorites", "serie", "watch"]).nullable()
  ),
  serieSlug: z.string().optional(),
  serieTmdbId: z.number().optional(),
  watchSlug: z.string().optional(),
  watchTmdbId: z.number().optional(),
  watchSeason: z.number().optional(),
  watchChapter: z.number().optional(),
  watchRoomId: z.string().optional(),
});

export const Route = createFileRoute("/_layout/")({
  validateSearch: zodValidator(modalSearchSchema),
  codeSplitGroupings: [["component", "loader"]],

  loader: async ({ context: { queryClient } }) => {
    const networks = [TmdbNetworks.NETFLIX, TmdbNetworks.HBO];

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["home", "networks"],
        queryFn: () => TmdbService.fetchMultipleNetworksSeries(networks),
      }),
      queryClient.prefetchQuery({
        queryKey: ["home", "popular"],
        queryFn: () => TmdbService.fetchHomePopular(),
      }),
    ]);
  },
  component: () => {
    const {
      modal,
      serieSlug,
      serieTmdbId,
      watchSlug,
      watchTmdbId,
      watchSeason,
      watchChapter,
    } = Route.useSearch();

    return (
      <>
        <Suspense>
          <HomeFeature />
          {modal === "favorites" && <FavoritesModal />}
          {serieSlug && serieTmdbId && (
            <SerieModal slug={serieSlug} tmdbId={serieTmdbId} />
          )}
          {watchSlug && watchTmdbId && watchSeason && watchChapter && (
            <WatchModal
              slug={watchSlug}
              tmdbId={watchTmdbId}
              season={watchSeason}
              chapter={watchChapter}
            />
          )}
        </Suspense>
      </>
    );
  },
});
