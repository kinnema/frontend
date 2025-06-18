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
        (set) => ({
            searches: [],
            patchSearches(searches) {
                const patchedState = produce(state => {
                    state.searches = [...state.searches, searches];
                })

                set(patchedState);
            },
            clearSearch() {
                set({
                    searches: []
                })
            },
        }),
        {
            name: "search",
        }
    )
);
