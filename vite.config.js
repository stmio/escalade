import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/escalade/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        stats: resolve(__dirname, "stats.html"),
        backup: resolve(__dirname, "backup.html"),
        reset: resolve(__dirname, "reset.html"),
      },
    },
  },
});
