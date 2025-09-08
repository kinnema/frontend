import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { IPluginEndpointSubtitle } from "../types/plugin.type";
import { Episode, ITmdbSerieDetails } from "../types/tmdb";
import { indexedDbZustandStorage } from "./stores/indexedDb";

export interface IWatchTogetherRoom {
  tmdbData: ITmdbSerieDetails;
  tmdbEpisodeData: Episode;
  roomId: string;
  watchLink: string;
}

interface WatchStore {
  selectedWatchLink: string | null;
  subtitles?: IPluginEndpointSubtitle[];
  room?: IWatchTogetherRoom;
}

interface WatchStoreActions {
  setSelectedWatchLink: (link: string | null) => void;
  setRoom: (room: IWatchTogetherRoom) => void;
  setSubtitles: (subtitles?: IPluginEndpointSubtitle[]) => void;
  clear: () => void;
  clearWatchLink: () => void;
  clearSubtitles: () => void;
}

export const useWatchStore = create(
  persist<WatchStore & WatchStoreActions>(
    (set, get) => ({
      selectedWatchLink: null,
      setSelectedWatchLink: (link) => set({ selectedWatchLink: link }),
      room: undefined,
      setRoom: (room) => set({ room }),
      clear: () =>
        set({ selectedWatchLink: null, room: undefined, subtitles: undefined }),
      clearSubtitles: () => set({ subtitles: undefined }),
      clearWatchLink: () => set({ selectedWatchLink: null }),
      setSubtitles(subtitles) {
        set({
          subtitles: [...(get().subtitles || []), ...(subtitles || [])],
        });
      },
    }),
    {
      name: "watchStore",
      storage: createJSONStorage(() => indexedDbZustandStorage),
    }
  )
);
