import { RxCollection, RxJsonSchema } from "rxdb";
import { ILastWatched } from "../types/lastWatched.type";

export type LastWatchedCollection = RxCollection<ILastWatched>;

export const lastWatchedSchema: RxJsonSchema<ILastWatched> = {
  version: 1,
  primaryKey: "id",
  type: "object",
  required: [
    "id",
    "name",
    "posterPath",
    "tmdbId",
    "atSecond",
    "totalSeconds",
    "episodeName",
    "network",
  ],
  indexes: ["tmdbId"],
  properties: {
    atSecond: {
      type: "number",
    },
    totalSeconds: {
      type: "number",
    },
    episodeName: {
      type: "string",
    },
    network: {
      type: "number",
    },
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
    season_number: {
      type: "number",
    },
    episode_number: {
      type: "number",
    },
    isWatched: {
      type: "boolean",
      default: false,
    },
    syncedAt: {
      type: ["string", "null"],
      default: null,
    },
    tmdbId: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999,
    },
  },
};
