import adapter from "@sveltejs/adapter-node"
import preprocess from "svelte-preprocess"

const isDev = process.env.NODE_ENV === "development"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: adapter(),
    paths: {
      base: isDev ? "" : "/new",
    },
  },
}

export default config
