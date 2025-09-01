import { BehaviorSubject } from "rxjs";

export enum AvailableCollectionForSync {
  LastWatchedCollection = "lastWatched",
  FavoritesCollection = "favorite",
}

export interface ICollectionSettingSync {
  name: string;
  description: string;
  key: AvailableCollectionForSync;
  enabled: boolean;
}

export const availableCollectionsForSync = [
  {
    key: AvailableCollectionForSync["LastWatchedCollection"],
    name: "Last Watched",
    description: "Your last watched items",
    enabled: false,
  },
  {
    key: AvailableCollectionForSync["FavoritesCollection"],
    name: "Favorites",
    description: "Your favorite items",
    enabled: false,
  },
];

export const availableCollectionsForSync$ = new BehaviorSubject<
  ICollectionSettingSync[]
>(availableCollectionsForSync);
