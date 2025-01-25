import { create } from "zustand";
import { IWatchResult } from "../models";

interface WatchStore {
  isPending: boolean;
  links: IWatchResult[];
  addLink: (link: IWatchResult) => void;
  removeLink: (id: string) => void;
  clear: () => void;
  selectedWatchLink: IWatchResult | null;
  setSelectedWatchLink: (link: IWatchResult) => void;
  setIsPending: (isPending: boolean) => void;
}

export const useWatchStore = create<WatchStore>((set) => ({
  links: [],
  isPending: true,
  selectedWatchLink: null,
  addLink: (link) =>
    set((state) => ({
      links: [...state.links, link],
    })),

  removeLink: (provider) =>
    set((state) => ({
      links: state.links.filter((link) => link.provider !== provider),
    })),

  clear: () => set({ links: [], selectedWatchLink: null, isPending: true }),

  setSelectedWatchLink: (link) => set({ selectedWatchLink: link }),
  setIsPending: (isPending) => set({ isPending }),
}));
