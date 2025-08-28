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
}
