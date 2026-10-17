import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Load all env vars (including non-VITE_ server secrets) into process.env for
// server-side code during local dev/build. On Vercel these are real environment variables.
// Server secrets are never exposed to the client bundle (only VITE_* are).
const serverEnv = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
for (const [key, value] of Object.entries(serverEnv)) {
  if (process.env[key] === undefined) process.env[key] = value;
}

export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
      "entities/lib/decode.js": path.resolve(process.cwd(), "node_modules/entities/lib/decode.js"),
      "entities/lib/encode.js": path.resolve(process.cwd(), "node_modules/entities/lib/encode.js"),
      entities: path.resolve(process.cwd(), "node_modules/entities"),
    },
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      // Use src/server.ts (our SSR error wrapper) as the server entry.
      server: { entry: "server" },
    }),
    viteReact(),
    tailwindcss(),
    // Deploy target is picked automatically: Vercel is detected from the VERCEL env var,
    // or set NITRO_PRESET (e.g. "node-server", "cloudflare-module") to force one.
    ...(command === "build" ? [nitro()] : []),
  ],
}));
