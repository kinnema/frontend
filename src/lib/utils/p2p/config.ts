import { BaseRoomConfig, RelayConfig, TurnConfig } from "trystero";

const password = import.meta.env.VITE_P2P_KEY;
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
      urls: "turn:161.35.65.1:3478",
      username: "username",
      credential: "password",
    },
  ],
  ...config,
});
