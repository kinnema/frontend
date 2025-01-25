import { create } from "zustand";
import { IWatchEventProviderSuccessData } from "../types/watch";

interface WatchStore {
  selectedWatchLink: IWatchEventProviderSuccessData | null;
}

interface WatchStoreActions {
  setSelectedWatchLink: (link: IWatchEventProviderSuccessData | null) => void;
  clear: () => void;
}

export const useWatchStore = create<WatchStore & WatchStoreActions>((set) => ({
  selectedWatchLink: null,
  setSelectedWatchLink: (link) => set({ selectedWatchLink: link }),
  clear: () => set({ selectedWatchLink: null }),
}));
