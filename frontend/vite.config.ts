import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStartVirtualModulesShim } from "./src/vite-tanstack-shim";

export default defineConfig({
  plugins: [
    tanstackStartVirtualModulesShim(),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "./src/server.ts" },
      router: { codeSplittingOptions: { addHmr: false } },
    }),
    react(),
  ],
});
