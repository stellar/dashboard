import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal Vite configuration
export default defineConfig({
  plugins: [react()],

  // API proxy to backend
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
