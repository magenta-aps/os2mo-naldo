import type { PlaywrightTestConfig } from "@playwright/test"

const config: PlaywrightTestConfig = {
  testDir: "./tests/",
  webServer: {
    command: "yarn run build && yarn run preview",
    port: 4173,
  },
}

export default config
