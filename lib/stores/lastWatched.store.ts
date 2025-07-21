import { produce } from "immer";
import { ILastWatched } from "../types/lastWatched";
import { createIndexDBStore } from "../utils/indexedDbStorage";

interface ILastWatchedStore {
  series: ILastWatched[];
}

interface ILastWatchedStoreActions {
  addSerie: (data: ILastWatched) => void;
  removeSerie: (id: string) => void;
  getSerie: (id: string) => ILastWatched | undefined;
  updateSerie: (id: string, updatedData: Partial<ILastWatched>) => void;
}

export const useLastWatchedStore = createIndexDBStore<
  ILastWatchedStore & ILastWatchedStoreActions
>({
  name: "last_watched",
  handler: (set, get) => ({
    series: [],
    addSerie(data) {
      const storage = get();
      const modifiedList = produce(storage.series, (serie) => {
        serie.push(data);

        return serie;
      });

      set({
        series: modifiedList,
      });
    },
    removeSerie(id) {
      const storage = get();
      const modifiedList = produce(storage.series, (serie) => {
        return serie.filter((s) => s.id !== id);
      });

      set({
        series: modifiedList,
      });
    },

    getSerie(id) {
      const storage = get();
      return storage.series.find((s) => s.id === id);
    },

    updateSerie(id, updatedData) {
      const storage = get();
      const modifiedList = produce(storage.series, (serie) => {
        let index = serie.find((v) => v.id === id);

        if (index) {
          Object.assign(index, updatedData);
        }
      });

      set({
        series: modifiedList,
      });
    },
  }),
});
