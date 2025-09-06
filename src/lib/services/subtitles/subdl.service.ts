import { useSubtitleStore } from "@/lib/stores/subtitle.store";

import { ISubdlResponse, ISubtitleResult } from "../../types/subtitle.type";
import { AbstractSubtitleService } from "./abstract.service";

export class SubDlService extends AbstractSubtitleService {
  async fetchSubtitles(
    tmdbId: number,
    seasonNumber: number,
    episodeNumber: number,
    langCode?: string
  ): Promise<ISubtitleResult[]> {
    const { providerConfig } = useSubtitleStore.getState();
    const subdlConfig = providerConfig.subdl;
    const apiKey = subdlConfig?.apiKey;
    if (!apiKey) {
      console.warn("SubDL API key is not set. Using fallback.");
    }

    const response = await fetch(
      `https://api.subdl.com/api/v1/subtitles?api_key=${apiKey}&tmdb_id=${tmdbId}&season_number=${seasonNumber}&episode_number=${episodeNumber}&type=tv&languages=${
        langCode || "en"
      }`
    );

    const data: ISubdlResponse = await response.json();

    if (data.subtitles.length < 1) {
      throw new Error("No subtitles found.");
    }

    return data.subtitles;
  }

  private async findSrtFile(
    dirPath: string,
    season_number: number,
    episode_number: number
  ): Promise<string | null> {
    const entries = await window.electronAPI.fs.readDir(dirPath);

    console.log("entries", entries, dirPath);

    for (const entry of entries) {
      console.log(entry.name, `S0${season_number}E0${episode_number}`);
      const entryPath = await window.electronAPI.fs.join(dirPath, entry.name);
      console.log("qqq", entryPath, entry);
      if (entry.isDirectory) {
        const srtPath = await this.findSrtFile(
          entryPath,
          season_number,
          episode_number
        );
        if (srtPath) {
          return srtPath;
        }
      } else if (
        entry.isFile &&
        entry.name.includes(`S0${season_number}E0${episode_number}`) &&
        entry.name.endsWith(".srt")
      ) {
        return entryPath;
      }
    }

    return null;
  }

  async downloadSubtitle(
    tmdbId: number,
    seasonNumber: number,
    episodeNumber: number,
    url: string
  ): Promise<string> {
    const uniqueId = `${tmdbId}-${seasonNumber}-${episodeNumber}-${Date.now()}`;
    const tempDir = await this.getTempDir();
    const zipFileName = `${uniqueId}.zip`;
    const zipFilePath = await window.electronAPI.fs.join(tempDir, zipFileName);
    const extractionDir = await window.electronAPI.fs.join(tempDir, uniqueId);

    try {
      const response = await fetch(`https://dl.subdl.com${url}`, {
        method: "GET",
      });

      const data = await response.arrayBuffer();

      await window.electronAPI.fs.createFile(zipFilePath, new Uint8Array(data));

      await window.electronAPI.fs.createDir(extractionDir);

      await window.electronAPI.fs.unzipSubtitle(zipFilePath, extractionDir);

      const srtFilePath = await this.findSrtFile(
        extractionDir,
        seasonNumber,
        episodeNumber
      );

      if (!srtFilePath) {
        throw new Error("No .srt file found in the zip archive.");
      }

      console.log("srt", srtFilePath);

      const subtitleContentBytes = await window.electronAPI.fs.readFile(
        srtFilePath
      );

      const subtitleContentString = new TextDecoder().decode(
        subtitleContentBytes
      );

      const vttContent = this.adjustSrtToVtt(subtitleContentString);
      const blob = new Blob([vttContent], { type: "text/vtt" });
      const blobUrl = URL.createObjectURL(blob);

      return blobUrl;
    } catch (error) {
      console.error("Failed to download and process subtitle:", error);
      throw error;
    } finally {
      // Cleanup the temporary files
      await window.electronAPI.fs.removeFile(zipFilePath).catch(console.error);
      await window.electronAPI.fs
        .removeFile(extractionDir)
        .catch(console.error);
    }
  }
}
