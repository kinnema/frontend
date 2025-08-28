import { useEffect } from "react";
import {
  subtitleProviders,
  SubtitleServiceFactory,
} from "../services/subtitles/index.service";
import { useWatchStore } from "../stores/watch.store";
import { ISubtitleResult } from "../types/subtitle.type";

interface IProps {
  tmdbId: number;
  seasonNumber: number;
  episodeNumber: number;
}

export function useSubtitles({ tmdbId, seasonNumber, episodeNumber }: IProps) {
  const subtitles = useWatchStore((state) => state.subtitles);

  useEffect(() => {
    if (!subtitles || subtitles.length < 1) {
    }
  }, [subtitles]);

  async function fetchSubtitles(
    langCode: string
  ): Promise<{ [key: string]: ISubtitleResult[] }> {
    const results = {} as { [key: string]: ISubtitleResult[] };
    for (const provider of subtitleProviders) {
      if (provider.enabled) {
        const service = SubtitleServiceFactory.getService(provider.name);
        if (service) {
          const data = await service.fetchSubtitles(
            tmdbId,
            seasonNumber,
            episodeNumber,
            langCode
          );

          results[provider.name] = data;
        } else {
          results[provider.name] = [];
        }
      }
    }

    return results;
  }

  async function downloadSubtitle(provider: string, url: string) {
    const service = SubtitleServiceFactory.getService(provider);
    if (service) {
      const data = await service.downloadSubtitle(
        tmdbId,
        seasonNumber,
        episodeNumber,
        url
      );

      return data;
    }
  }

  return {
    fetchSubtitles,
    downloadSubtitle,
  };
}
