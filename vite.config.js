import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// Minimal Vite configuration
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Test with minimal polyfills - only the most essential ones
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      modules: {
        buffer: true,
        process: true,
        crypto: true,
      },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          "stellar-sdk": ["@stellar/stellar-sdk"],
          d3: ["d3"],
        },
      },
    },
  },

  // API proxy to backend
  server: {
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
