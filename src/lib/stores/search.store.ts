import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Result } from "../types/tmdb";

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
    }
  )
);
