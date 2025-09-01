import { IPluginEndpointSubtitle } from "./plugin.type";

interface IPluginEventEmitterTryingPayload {
  pluginId: string;
}

type IPluginEventEmitterFailedPayload = IPluginEventEmitterTryingPayload;

export interface IPluginEventEmitterSuccessPayload {
  pluginId: string;
  url: string;
  subtitles?: IPluginEndpointSubtitle[];
}

export type IPluginEventType =
  | "trying_provider"
  | "provider_success"
  | "provider_failed";

export interface IPluginEventEmitterTryingProvider {
  type: "trying_provider";
  data: IPluginEventEmitterTryingPayload;
}

export interface IPluginEventEmitterProviderSuccess {
  type: "provider_success";
  data: IPluginEventEmitterSuccessPayload;
}

export interface IPluginEventEmitterProviderFailed {
  type: "provider_failed";
  data: IPluginEventEmitterFailedPayload;
}

export type IPluginEvent =
  | IPluginEventEmitterTryingProvider
  | IPluginEventEmitterProviderSuccess
  | IPluginEventEmitterProviderFailed;

export type IPluginEventEmitter = {
  event: (event: IPluginEvent) => void;
  end: () => void;
};
export type IPluginEventData = {
  type: IPluginEventType;
  data:
    | IPluginEventEmitterTryingPayload
    | IPluginEventEmitterSuccessPayload
    | IPluginEventEmitterFailedPayload;
};
