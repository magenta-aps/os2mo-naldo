import { defineConfig, devices } from "@playwright/test"

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5000"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ["junit", { outputFile: "test-results/results.xml" }],
        ["html", { open: "never" }],
      ]
    : "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  // Global setup: snapshot the clean DB before all tests
  globalSetup: "./e2e/global-setup.ts",
  projects: [
    // Auth setup — runs first, saves browser state for the other projects
    {
      name: "auth-setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Re-use the authenticated state from the setup project
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["auth-setup"],
    },
  ],
})
