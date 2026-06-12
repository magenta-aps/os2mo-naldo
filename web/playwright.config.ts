import type { PlaywrightTestConfig } from "@playwright/test"

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5000"

const config: PlaywrightTestConfig = {
  testDir: "e2e-real",
  // Serial execution — tests share a DB that is restored between each test,
  // so parallel runs would corrupt each other's state.
  workers: 1,
  use: {
    baseURL: BASE_URL,
    storageState: "e2e-real/.auth/state.json",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  globalSetup: "./e2e-real/global-setup.ts",
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["junit", { outputFile: "playwright-report-integration/results.xml" }]]
    : [["list"]],
  outputDir: "test-results-integration",
}

export default config
