import { sveltekit } from "@sveltejs/kit/vite"

const config = {
  plugins: [sveltekit()],
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
}

export default config
