import { sveltekit } from "@sveltejs/kit/vite"

// No jsdoc type: the repo's vite 4 types and vitest's bundled vite 5 types
// disagree, and either annotation fails svelte-check for the other's keys.
const config = {
  plugins: [sveltekit()],
  // Keep vitest away from the playwright specs in e2e/.
  test: {
    include: ["tests/**/*.test.ts"],
  },
}

export default config
