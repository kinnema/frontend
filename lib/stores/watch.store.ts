import { create } from "zustand";
import { IWatchResult } from "../models";

interface WatchStore {
  links: IWatchResult[];
  addLink: (link: IWatchResult) => void;
  removeLink: (id: string) => void;
  clear: () => void;
  selectedWatchLink: IWatchResult | null;
  setSelectedWatchLink: (link: IWatchResult) => void;
}

export const useWatchStore = create<WatchStore>((set) => ({
  links: [],
  selectedWatchLink: null,
  addLink: (link) =>
    set((state) => ({
      links: [...state.links, link],
    })),

  removeLink: (provider) =>
    set((state) => ({
      links: state.links.filter((link) => link.provider !== provider),
    })),

  clear: () => set({ links: [], selectedWatchLink: null }),

  setSelectedWatchLink: (link) => set({ selectedWatchLink: link }),
}));
