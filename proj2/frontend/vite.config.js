import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom", 
    setupFiles: "./src/setupTests.js",
    coverage: {
      provider: "v8", // or 'istanbul'
      reporter: ["text", "lcov", "html"], // outputs both CLI and HTML reports
      reportsDirectory: "./coverage",
      all: true, // include all files, not just tested ones
      exclude: ["node_modules/", "vite.config.*", "vitest.config.*"],
    },
  },
});
