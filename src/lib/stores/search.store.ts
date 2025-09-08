import { produce } from "immer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Result } from "../types/tmdb";
import { indexedDbZustandStorage } from "./stores/indexedDb";

interface IStore {
  searches: Result[];
  patchSearches: (searches: Result) => void;
  clearSearch: () => void;
}

export const useSearchStore = create(
  persist<IStore>(
    (set, get) => ({
      searches: [],
      patchSearches(patchedSearches: Result) {
        const searches = get().searches;
        const patchedState = produce(searches, (state) => {
          state = [...searches, patchedSearches];

          return [...new Set(state)];
        });

        set({
          searches: patchedState,
        });
      },
      clearSearch() {
        set({
          searches: [],
        });
      },
    }),
    {
      name: "search",
      storage: createJSONStorage(() => indexedDbZustandStorage),
    }
  )
);
