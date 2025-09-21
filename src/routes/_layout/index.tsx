import { Loading } from "@/components/Loading";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

type IndexSearchParams = {
  modal?: "login" | "register" | "favorites" | "serie" | "watch";
  serieSlug?: string;
  serieTmdbId?: number;
  watchSlug?: string;
  watchTmdbId?: number;
  watchSeason?: number;
  watchChapter?: number;
  watchRoomId?: string;
};

const HomeFeature = lazy(() => import("@/lib/features/home/HomeFeature"));
const SerieModal = lazy(() => import("@/components/modals/SerieModal"));
const WatchModal = lazy(() => import("@/components/modals/WatchModal"));
const FavoritesModal = lazy(() => import("@/components/modals/FavoritesModal"));

export const Route = createFileRoute("/_layout/")({
  validateSearch: (search): IndexSearchParams => {
    return {
      modal:
        (search.modal as
          | "login"
          | "register"
          | "favorites"
          | "serie"
          | "watch") || undefined,
      serieSlug: (search.serieSlug as string) || undefined,
      serieTmdbId: search.serieTmdbId ? Number(search.serieTmdbId) : undefined,
      watchSlug: (search.watchSlug as string) || undefined,
      watchTmdbId: search.watchTmdbId ? Number(search.watchTmdbId) : undefined,
      watchSeason: search.watchSeason ? Number(search.watchSeason) : undefined,
      watchChapter: search.watchChapter
        ? Number(search.watchChapter)
        : undefined,
      watchRoomId: (search.watchRoomId as string) || undefined,
    };
  },
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
        <Suspense fallback={<Loading fullscreen />}>
          <HomeFeature />
        </Suspense>
        {modal === "favorites" && (
          <Suspense fallback={<Loading fullscreen />}>
            <FavoritesModal />
          </Suspense>
        )}
        {serieSlug && serieTmdbId && (
          <Suspense fallback={<Loading fullscreen />}>
            <SerieModal slug={serieSlug} tmdbId={serieTmdbId} />
          </Suspense>
        )}
        {watchSlug && watchTmdbId && watchSeason && watchChapter && (
          <Suspense fallback={<Loading fullscreen />}>
            <WatchModal
              slug={watchSlug}
              tmdbId={watchTmdbId}
              season={watchSeason}
              chapter={watchChapter}
            />
          </Suspense>
        )}
      </>
    );
  },
});
