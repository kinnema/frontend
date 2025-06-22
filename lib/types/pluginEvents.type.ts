interface IPluginEventEmitterTryingPayload {
  pluginId: string;
}

type IPluginEventEmitterFailedPayload = IPluginEventEmitterTryingPayload;

interface IPluginEventEmitterSuccessPayload {
  pluginId: string;
  url: string;
}

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
