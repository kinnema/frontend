import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kinnema.app',
  appName: 'kinnema',
  webDir: 'dist',
  server: {
    url: "http://192.168.1.227:3000",
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,

    }
  },
  overrideUserAgent: "VLC/3.0.17.4 LibVLC/3.0.9",
};

export default config;
