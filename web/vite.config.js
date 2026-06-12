import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [/** @type {any} */ (sveltekit())],
  test: {
    include: ["tests/**/*.{test,spec}.{js,ts}"],
  },
})
