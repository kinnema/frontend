"use client";

import { Loading } from "@/lib/components/Loading";
import { Modal } from "@/lib/components/Modal";
import { IWatchResult } from "@/lib/models";
import {
  fetchEpisodeDetails,
  fetchFromVidsrc,
  fetchSerieWatchLink,
  searchSerieOnTMDB,
} from "@/lib/services/series.service";
import { TurkishProviderIds } from "@/lib/types/networks";
import { Episode, ITmdbSearchResults } from "@/lib/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "react-hot-toast";
import ReactPlayer from "react-player";

interface IProps {
  params: {
    slug: string;
    season: string;
    chapter: string;
  };
}

const pathNameRegex = "/dizi/(.*)/sezon-([0-9])/bolum-([0-9])";

export default function ChapterPage({ params }: IProps) {
  const pathName = usePathname();
  const season = parseInt(params.season.replace("sezon-", ""));
  const chapter = parseInt(params.chapter.replace("bolum-", ""));
  const searchParams = useSearchParams();
  const tmdbSearch = useQuery<ITmdbSearchResults>({
    queryKey: ["tmdb-search", params.slug],
    networkMode: "offlineFirst",
    queryFn: () => searchSerieOnTMDB(params.slug),
  });

  const tmdbData = useQuery<Episode>({
    enabled: tmdbSearch.isSuccess && tmdbSearch.data.total_results > 0,
    queryKey: ["tmdb-episode-details", params.slug, season, chapter],
    networkMode: "offlineFirst",
    queryFn: () =>
      fetchEpisodeDetails(tmdbSearch.data!.results[0].id, season, chapter),
  });

  const isTurkishProvider = useMemo(() => {
    const network = searchParams.get("network");

    return TurkishProviderIds.includes(parseInt(network!));
  }, []);

  const serieWatchLink = useQuery<IWatchResult>({
    enabled: tmdbData.isSuccess,
    networkMode: "offlineFirst",
    queryKey: ["dizi-watch", params.slug, season, chapter],
    queryFn: () => {
      if (!isTurkishProvider) {
        return fetchFromVidsrc(
          tmdbSearch.data?.results[0].id!,
          season,
          chapter
        );
      } else {
        return fetchSerieWatchLink(params.slug, season, chapter);
      }
    },
    retry: 3,
  });

  if (tmdbSearch.isSuccess && tmdbSearch.data.total_results < 1) {
    return <div className="text-red-500">Dizi bulunamadı</div>;
  }

  if (tmdbData.isError) {
    return <div className="text-red-500">Dizi bulunamadı</div>;
  }

  if (tmdbData.isPending) {
    return <Loading fullscreen />;
  }

  if (serieWatchLink.isError) {
    toast.error("Yükleme hatasi, tekrar deneniyor..");
  }

  return (
    <Modal
      isOpen={pathName.match(pathNameRegex) ? true : false}
      bgColor="black"
    >
      <div id="header">
        <div id="details" className="flex flex-col">
          <h1 className="text-white text-3xl">
            {tmdbSearch.data!.results[0].original_name}
          </h1>
          <span className="text-white text-lg">{tmdbData.data!.name}</span>
        </div>

        <div className="opacity-0 group-hover:opacity-100">test</div>
      </div>

      {serieWatchLink.isPending ? (
        <Loading />
      ) : (
        <ReactPlayer
          url={serieWatchLink.data?.url}
          width={"100%"}
          height={"90%"}
          stopOnUnmount
          playing
          style={{
            backgroundColor: "black",
            width: "100%",
            height: "100%",
          }}
          light={`https://image.tmdb.org/t/p/original/${
            tmdbSearch.data!.results[0].poster_path
          }`}
          controls
        />
      )}
    </Modal>
  );
}
