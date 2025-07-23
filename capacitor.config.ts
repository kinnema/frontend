import type { CapacitorConfig } from "@capacitor/cli";
import "dotenv/config";

const config: CapacitorConfig = {
  appId: "com.kinnema.app",
  appName: "kinnema",
  webDir: "dist",
  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
  },
  overrideUserAgent: "VLC/3.0.17.4 LibVLC/3.0.9",
};

export default config;
