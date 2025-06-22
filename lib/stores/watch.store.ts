import { create } from "zustand";

interface WatchStore {
  selectedWatchLink: string | null;
}

interface WatchStoreActions {
  setSelectedWatchLink: (link: string | null) => void;
  notExternalLink: boolean;
  clear: () => void;
  setNotExternalLink: (value: boolean) => void;
}

export const useWatchStore = create<WatchStore & WatchStoreActions>((set) => ({
  selectedWatchLink: null,
  setSelectedWatchLink: (link) => set({ selectedWatchLink: link }),
  clear: () => set({ selectedWatchLink: null, notExternalLink: false }),
  notExternalLink: false,
  setNotExternalLink: (value: boolean) => set({ notExternalLink: value }),
}));
