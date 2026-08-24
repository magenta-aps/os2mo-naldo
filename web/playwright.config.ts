import type { PlaywrightTestConfig } from "@playwright/test"

// Runs the suite in ./e2e against a frontend and a MO. The defaults target
// the local dev setup: frontend on :5173 (docker compose up -d), MO +
// Keycloak on :5000 — override with BASE_URL / MO_URL / KEYCLOAK_URL.
const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  timeout: 120_000,
  retries: 1,
  // Locally every test shares one compiling dev server, so tests run one at
  // a time; CI serves a prebuilt preview, where parallel tests are safe.
  workers: process.env.CI ? 2 : 1,
  // Log in once (global-setup.ts) instead of paying the Keycloak redirect
  // in every test.
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:5173",
    storageState: "e2e/.auth/state.json",
  },
}

export default config
