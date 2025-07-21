import type { CapacitorConfig } from "@capacitor/cli";
import "dotenv/config";

const config: CapacitorConfig = {
  appId: "com.kinnema.app",
  appName: "kinnema",
  webDir: "dist",
  server: {
    url: process.env.FRONTEND_URL,
    cleartext: process.env.FRONTEND_URL?.startsWith("http://"),
  },
  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
  },
  overrideUserAgent: "VLC/3.0.17.4 LibVLC/3.0.9",
};

export default config;
