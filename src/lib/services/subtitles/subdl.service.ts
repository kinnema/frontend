import { useSubtitleStore } from "@/lib/stores/subtitle.store";
import { join } from "@tauri-apps/api/path";
import {
  mkdir,
  readDir,
  readFile,
  remove,
  writeFile,
} from "@tauri-apps/plugin-fs";
import { Command } from "@tauri-apps/plugin-shell";
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
    const entries = await readDir(dirPath);

    for (const entry of entries) {
      console.log(entry.name, `S0${season_number}E0${episode_number}`);
      const entryPath = await join(dirPath, entry.name);
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

  adjustSrtToVtt(srtContent: string, delayMs = 800) {
    // Split the SRT content into lines and initialize VTT output
    const lines: string[] = srtContent.trim().split("\n");
    let vttContent: string = "WEBVTT\n\n";
    let currentSubtitle: string[] = [];
    let isTimestampLine: boolean = false;
    let sequenceNumber: number = 0;

    // Regex to strictly match SRT timestamp format: HH:MM:SS,mmm --> HH:MM:SS,mmm
    const timestampRegex: RegExp =
      /^\d{2}:\d{2}:\d{2},\d{3}\s-->\s\d{2}:\d{2}:\d{2},\d{3}$/;

    for (let i: number = 0; i < lines.length; i++) {
      const line: string = lines[i]!.trim();

      // Skip empty lines
      if (line === "") {
        if (currentSubtitle.length > 0) {
          vttContent += currentSubtitle.join("\n") + "\n\n";
          currentSubtitle = [];
        }
        isTimestampLine = false;
        continue;
      }

      // Check if the line is a sequence number (e.g., "1", "2")
      if (/^\d+$/.test(line)) {
        sequenceNumber = parseInt(line, 10);
        console.log(`Found sequence number: ${sequenceNumber}`);
        continue;
      }

      // Check if the line is a timestamp
      if (timestampRegex.test(line)) {
        isTimestampLine = true;
        console.log(`Processing timestamp: ${line}`);

        const [start, end]: string[] = line
          .split(" --> ")
          .map((time: string) => {
            // Convert SRT time (HH:MM:SS,mmm) to milliseconds
            const [hours, minutes, secondsAndMs]: string[] = time.split(":");
            const [seconds, milliseconds]: string[] = secondsAndMs!.split(",");
            const totalMs: number =
              parseInt(hours!, 10) * 3600000 +
              parseInt(minutes!, 10) * 60000 +
              parseInt(seconds!, 10) * 1000 +
              parseInt(milliseconds!, 10);

            // Subtract delay
            const adjustedMs: number = Math.max(0, totalMs - delayMs);

            // Convert back to VTT time format (HH:MM:SS.mmm)
            const newHours: string = Math.floor(adjustedMs / 3600000)
              .toString()
              .padStart(2, "0");
            const newMinutes: string = Math.floor(
              (adjustedMs % 3600000) / 60000
            )
              .toString()
              .padStart(2, "0");
            const newSeconds: string = Math.floor((adjustedMs % 60000) / 1000)
              .toString()
              .padStart(2, "0");
            const newMilliseconds: string = (adjustedMs % 1000)
              .toString()
              .padStart(3, "0");

            return `${newHours}:${newMinutes}:${newSeconds}.${newMilliseconds}`;
          });

        vttContent += `${start} --> ${end}\n`;
        continue;
      }

      // If not a timestamp or sequence number, treat as subtitle text
      if (!isTimestampLine) {
        console.log(`Unexpected line (not timestamp or sequence): ${line}`);
      } else {
        console.log(`Adding subtitle text: ${line}`);
        currentSubtitle.push(line);
      }
    }

    // Add the last subtitle block if exists
    if (currentSubtitle.length > 0) {
      vttContent += currentSubtitle.join("\n") + "\n";
    }

    return vttContent;
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
    const zipFilePath = await join(tempDir, zipFileName);
    const extractionDir = await join(tempDir, uniqueId);
    console.log(zipFilePath);
    try {
      const response = await fetch(`https://dl.subdl.com${url}`, {
        method: "GET",
      });

      const data = await response.arrayBuffer();

      await writeFile(zipFilePath, new Uint8Array(data));

      await mkdir(extractionDir, { recursive: true });

      const command = Command.create("unzip-command", [
        zipFilePath,
        "-d",
        extractionDir,
      ]);
      const output = await command.execute();
      if (output.code !== 0) {
        throw new Error(`Failed to unzip file: ${output.stderr}`);
      }

      const srtFilePath = await this.findSrtFile(
        extractionDir,
        seasonNumber,
        episodeNumber
      );

      if (!srtFilePath) {
        throw new Error("No .srt file found in the zip archive.");
      }

      console.log("srt", srtFilePath);

      const subtitleContentBytes = await readFile(srtFilePath);

      const subtitleContentString = new TextDecoder().decode(
        subtitleContentBytes
      );

      const vttContent = this.adjustSrtToVtt(subtitleContentString, 700);
      const blob = new Blob([vttContent], { type: "text/vtt" });
      const blobUrl = URL.createObjectURL(blob);

      return blobUrl;
    } catch (error) {
      console.error("Failed to download and process subtitle:", error);
      throw error;
    } finally {
      // Cleanup the temporary files
      await remove(zipFilePath).catch(console.error);
      await remove(extractionDir, { recursive: true }).catch(console.error);
    }
  }
}
