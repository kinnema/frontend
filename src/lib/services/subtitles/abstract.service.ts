import { ISubtitleResult } from "@/lib/types/subtitle.type";
import { appCacheDir, join } from "@tauri-apps/api/path";
import { BaseDirectory, mkdir } from "@tauri-apps/plugin-fs";

export abstract class AbstractSubtitleService {
  protected tempDir: string | null = null;

  constructor() {
    // Constructor is now clean and synchronous.
  }

  /**
   * Lazily initializes and returns the temporary directory for subtitles.
   */
  protected async getTempDir(): Promise<string> {
    if (this.tempDir) {
      return this.tempDir;
    }

    try {
      const appDir = await appCacheDir();
      const tempDir = await join(appDir, "subtitles");

      await mkdir("subtitles", {
        recursive: true,
        baseDir: BaseDirectory.AppCache,
      });

      this.tempDir = tempDir;
      return tempDir;
    } catch (error) {
      console.error("Failed to create temporary directory:", error);
      throw error;
    }
  }

  abstract fetchSubtitles(
    tmdbId: number,
    seasonNumber: number,
    episodeNumber: number,
    langCode: string
  ): Promise<ISubtitleResult[]>;

  abstract downloadSubtitle(
    tmdbId: number,
    seasonNumber: number,
    episodeNumber: number,
    url: string
  ): Promise<string | null>;

  adjustSrtToVtt(srtContent: string, delayMs = 750) {
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
}
