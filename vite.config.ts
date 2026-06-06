import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  server: {
    host: true,
  },
  plugins: [
    basicSsl(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            // Never cache Supabase API responses — always hit the network
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*/i,
            handler: "NetworkOnly" as const,
          },
        ],
      },
    }),
    {
      name: "geojson",
      transform(code, id) {
        if (id.endsWith(".geojson")) {
          return { code: `export default ${code}`, map: null };
        }
      },
    },
  ],
});
