export interface IFavorite {
  id: string;
  name: string;
  posterPath: string;
  tmdbId: number;
  createdAt: string;
  syncedAt?: string | null;
}

export type IAddFavorite = IFavorite;

export type IRemoveFavorite = Pick<IFavorite, "id">;
