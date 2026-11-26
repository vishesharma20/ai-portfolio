import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    // Any test file that renders React needs a DOM (.tsx tests, by
    // convention here); pure-logic tests (.ts) stay on the faster `node`
    // environment. environmentMatchGlobs is checked in order, first match
    // wins, so this one rule replaces the earlier hook-specific one.
    environment: "node",
    environmentMatchGlobs: [["**/*.test.tsx", "jsdom"]],
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
});
