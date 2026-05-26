import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
