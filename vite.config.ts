import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import svgrPlugin from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  return {
    esbuild: {
      drop: isProd ? ["console", "debugger"] : [],
    },
    // This changes the out put dir from dist to build
    // comment this out if that isn't relevant for your project
    server: {
      port: 3000,
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: [
        {
          find: /^~/,
          replacement: "",
        },
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
    },
    build: {
      outDir: "build",
    },
    plugins: [
      wasm(),
      topLevelAwait(),
      reactRefresh(),
      eslint({
        failOnWarning: false,
        failOnError: false,
      }),
      tsconfigPaths(),
      svgrPlugin({
        svgrOptions: {
          icon: true,
          // ...svgr options (https://react-svgr.com/docs/options/)
        },
      }),
    ],
  }
});
