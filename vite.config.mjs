import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { VitePWA } from "vite-plugin-pwa";
import topLevelAwait from "vite-plugin-top-level-await";
import tsconfigPaths from "vite-tsconfig-paths";
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
      disable: process.env.TAURI_ENV_ARCH ? true : false,
    }),
  ],

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    outDir: "dist",
  },
  server: {
    port: 3000,
  },
});
