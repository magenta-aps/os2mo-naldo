import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30000,
    watch: false,
  },
})
