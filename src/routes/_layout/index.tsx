import { FavoritesModal } from "@/components/modals/FavoritesModal";
import { LoginModal } from "@/components/modals/LoginModal";
import { RegisterModal } from "@/components/modals/RegisterModal";
import { SerieModal } from "@/components/modals/SerieModal";
import { WatchModal } from "@/components/modals/WatchModal";
import { HomeFeature } from "@/lib/features/home/HomeFeature";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Suspense } from "react";
import z from "zod";

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
    // Prefetch data for home page
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["home", "blutv"],
        queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.BLUTV),
      }),
      queryClient.prefetchQuery({
        queryKey: ["home", "gain"],
        queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.GAIN),
      }),
      queryClient.prefetchQuery({
        queryKey: ["home", "exxen"],
        queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.EXXEN),
      }),
      queryClient.prefetchQuery({
        queryKey: ["home-data"],
        queryFn: () => TmdbService.fetchHomeData(),
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
      watchRoomId,
    } = Route.useSearch();

    return (
      <>
        <Suspense>
          <HomeFeature />
          {/* Modal rendering based on search params */}
          {modal === "login" && <LoginModal />}
          {modal === "register" && <RegisterModal />}
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
              room={watchRoomId}
            />
          )}
        </Suspense>
      </>
    );
  },
});
