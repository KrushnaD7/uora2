import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Static SPA build. Output goes to dist/ and is served directly by the web
// server -- no Node process for the frontend at all, which is what keeps the
// app inside Hostinger's process budget.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Mirrors the Next.js "@/..." alias so ported files need no import edits.
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Fewer, larger chunks: shared hosting serves these as plain files, and a
    // smaller request count is friendlier to the connection limits.
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 5173,
    // Dev-only: forward /api to the local Express server so the SPA and API
    // look same-origin in development, exactly as production will behave.
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
