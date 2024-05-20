export interface IHomeResults {
  trends: ISerie[];
  new_series: ISerie[];
  last_episodes: ISerie[];
}

export interface IResult<T> {
  results: T;
}

export interface IWatchResult {
  url: string;
}

export interface ISerie {
  name: string;
  image: string;
  href: string;
  desc?: string;
  video_url?: string;
}

export interface ISeriePageEpisode {
  episodes: {
    [season: string]: ISerie[];
  };
}

export interface ISeriePageMetadata {
  name: string;
  desc: string;
  image: string;
}

export interface ISeriePage {
  episodes: ISeriePageEpisode;
  seasons: string[];
  metadata: ISeriePageMetadata;
}
