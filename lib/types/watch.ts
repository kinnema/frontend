import { Def13 } from "../api";

export interface IWatchEventProviderSuccessData {
  provider: string;
  url: string;
}

export interface IWatchEventInit {
  type: "init";
  data: Def13;
}

export interface IWatchEventEnd {
  type: "end";
}

export interface IWatchEventTryingProvider {
  type: "trying_provider";
  data: string;
}

export interface IWatchEventProviderSuccess {
  type: "provider_success";
  data: IWatchEventProviderSuccessData;
}

export interface IWatchEventProviderFailed {
  type: "provider_failed";
  data: string;
}

export type IWatchEvent =
  | IWatchEventInit
  | IWatchEventTryingProvider
  | IWatchEventProviderSuccess
  | IWatchEventProviderFailed
  | IWatchEventEnd;

export type IWatchEventEmitter = {
  event: (event: IWatchEvent) => void;
  end: () => void;
};
