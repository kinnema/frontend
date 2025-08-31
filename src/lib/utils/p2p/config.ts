import { BaseRoomConfig, RelayConfig, TurnConfig } from "trystero";

const password = import.meta.env.VITE_P2P_KEY;
const _TURN_SERVER =
  (import.meta.env.VITE_TURN_SERVER as string)?.split("@") ?? [];
const [credentials = "", server = ""] = _TURN_SERVER;
const [TURN_USERNAME = "", TURN_CREDENTIAL = ""] = credentials.split(":") ?? [];
const TURN_SERVER = server;

type P2PConfig = BaseRoomConfig & RelayConfig & TurnConfig;

export const getP2pConfig: (config?: Partial<P2PConfig>) => P2PConfig = (
  config
) => ({
  appId: "com.kinnema",
  password,
  turnConfig: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
    {
      urls: `turn:${TURN_SERVER}`,
      username: TURN_USERNAME,
      credential: TURN_CREDENTIAL,
    },
  ],
  ...config,
});
