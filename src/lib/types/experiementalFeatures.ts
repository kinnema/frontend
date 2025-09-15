export interface IExperimentalFeature {
  id: ExperimentalFeature;
  name: string;
  description: string;
  enabled: boolean;
  translationKey?: string;
  warning?: string;
  warningTranslationKey?: string;
  descriptionTranslationKey?: string;
  nativeOnly?: boolean;
}

export enum ExperimentalFeature {
  Sync = "sync",
  WatchTogether = "watchTogether",
  Subtitles = "subtitles",
}
