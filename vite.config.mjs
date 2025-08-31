import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { VitePWA } from "vite-plugin-pwa";
import topLevelAwait from "vite-plugin-top-level-await";
import tsconfigPaths from "vite-tsconfig-paths";

const isElectron = process.env.ELECTRON === "true";
const isTauri = process.env.TAURI_ENV_ARCH !== undefined;

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    topLevelAwait(),
    nodePolyfills({
      // Include polyfills for `process` and other Node.js globals
      process: true,
    }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: "public/manifest.json",
      minify: true,
      disable: isTauri || isElectron,
      workbox: {
        //FIXME: delete this
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      },
    }),
  ],

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    outDir: "dist",
    // Ensure proper base path for Electron
    ...(isElectron && {
      rollupOptions: {
        external: ["electron"],
      },
    }),
  },
  server: {
    port: 3000,
  },
  // Handle file:// protocol for Electron
  base: isElectron ? "./" : "/",
});
