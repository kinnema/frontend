import { create } from "zustand";

interface WatchStore {
  selectedWatchLink: string | null;
}

interface WatchStoreActions {
  setSelectedWatchLink: (link: string | null) => void;
  clear: () => void;
}

export const useWatchStore = create<WatchStore & WatchStoreActions>((set) => ({
  selectedWatchLink: null,
  setSelectedWatchLink: (link) => set({ selectedWatchLink: link }),
  clear: () => set({ selectedWatchLink: null }),
}));
