export interface IFavorite {
  id: string;
  name: string;
  posterPath: string;
  tmdbId: number;
  createdAt: string;
}

export type IAddFavorite = IFavorite;

export type IRemoveFavorite = Pick<IFavorite, "id">;
