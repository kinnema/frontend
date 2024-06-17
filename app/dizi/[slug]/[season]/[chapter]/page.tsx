"use client";

import { Loading } from "@/lib/components/Loading";
import { Modal } from "@/lib/components/Modal";
import { IWatchResult } from "@/lib/models";
import AppService from "@/lib/services/app.service";
import TmdbService from "@/lib/services/tmdb.service";

import { TurkishProviderIds } from "@/lib/types/networks";
import { ITmdbSerieDetails } from "@/lib/types/tmdb";
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

  const tmdbData = useQuery<ITmdbSerieDetails>({
    queryKey: ["tmdb-details-with-season", params.slug],
    queryFn: async () => {
      const tmdbSearch = await TmdbService.searchSeries(params.slug);
      const tmdbData = await TmdbService.fetchSerie(tmdbSearch.results[0].id);

      return tmdbData;
    },
  });

  const isTurkishProvider = useMemo(() => {
    const network = searchParams.get("network");

    return TurkishProviderIds.includes(parseInt(network!));
  }, []);

  const serieWatchLink = useQuery<IWatchResult>({
    enabled: tmdbData.isSuccess && isTurkishProvider,
    networkMode: "offlineFirst",
    queryKey: ["dizi-watch", params.slug, season, chapter],
    queryFn: async () => {
      return AppService.fetchSeries(params.slug, season, chapter);
    },
    retry: 3,
  });

  if (tmdbData.isError) {
    return <div className="text-red-500">Dizi bulunamadı</div>;
  }

  if (tmdbData.isPending) {
    return <Loading fullscreen />;
  }

  if (!serieWatchLink.isStale && serieWatchLink.isError) {
    toast.error("Yükleme hatasi, tekrar deneniyor..");
  }

  return (
    <Modal
      isOpen={pathName.match(pathNameRegex) ? true : false}
      bgColor="black"
    >
      <div id="header">
        <div id="details" className="flex flex-col">
          <h1 className="text-white text-3xl">{tmdbData.data.original_name}</h1>
          <span className="text-white text-lg">{tmdbData.data!.name}</span>
        </div>

        <div className="opacity-0 group-hover:opacity-100">test</div>
      </div>

      {!isTurkishProvider ? (
        <iframe
          className="w-full h-full"
          src={`https://vidsrc.to/embed/tv/${tmdbData.data.id}/${season}/${chapter}`}
        />
      ) : serieWatchLink.isPending ? (
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
          light={`https://image.tmdb.org/t/p/original/${tmdbData.data.poster_path}`}
          controls
        />
      )}

      {}
    </Modal>
  );
}
