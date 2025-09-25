import type { BaseRoomConfig, RelayConfig, TurnConfig } from "trystero";

const password = import.meta.env.VITE_P2P_KEY;
const _TURN_SERVER =
  (import.meta.env.VITE_TURN_SERVER as string)?.split("@") ?? [];
const [credentials = "", server = ""] = _TURN_SERVER;
const [TURN_USERNAME = "", TURN_CREDENTIAL = ""] = credentials.split(":") ?? [];
const TURN_SERVER = server;

const _STUN_SERVER =
  (import.meta.env.VITE_STUN_SERVER as string)?.split("@") ?? [];
const [stunCredentials = "", stunServer = ""] = _STUN_SERVER;
const [STUN_USERNAME = "", STUN_CREDENTIAL = ""] =
  stunCredentials.split(":") ?? [];
const STUN_SERVER = stunServer;

type P2PConfig = BaseRoomConfig & RelayConfig & TurnConfig;

export const getWatchTogetherConfig: (
  config?: Partial<P2PConfig>,
  withTurn?: boolean
) => P2PConfig = (config, withTurn) => {
  const turnConfig = [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: `turn:${TURN_SERVER}`,
      username: TURN_USERNAME,
      credential: TURN_CREDENTIAL,
    },
    {
      urls: `stun:${STUN_SERVER}`,
      username: STUN_USERNAME,
      credential: STUN_CREDENTIAL,
    },
  ];

  return {
    appId: "com.kinnema",
    password,
    turnConfig: withTurn ? turnConfig : [],
    ...config,
  };
};
