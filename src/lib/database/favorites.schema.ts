import { RxCollection, RxJsonSchema } from "rxdb";
import { IFavorite } from "../types/favorite.type";

export type FavoritedCollection = RxCollection<IFavorite>;

export const favoriteSchema: RxJsonSchema<IFavorite> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  required: ["id", "name", "posterPath", "tmdbId", "createdAt"],
  indexes: ["tmdbId"],
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    posterPath: {
      type: "string",
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
    tmdbId: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999,
    },
    syncedAt: {
      type: ["string", "null"],
      default: null,
    },
  },
};
