import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import tsconfigPaths from "vite-tsconfig-paths";

const isElectron = process.env.ELECTRON === "true";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    topLevelAwait(),
    nodePolyfills({
      process: true,
    }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          hls: ["hls.js"],
          rxdb: ["rxdb", "rxjs"],
          nostr: ["nostr-tools"],
        },
      },
    },
    ...(isElectron && {
      rollupOptions: {
        external: ["electron"],
      },
    }),
    cssMinify: "lightningcss",
  },
  server: {
    port: 3000,
  },
  base: isElectron ? "./" : "/",
});
