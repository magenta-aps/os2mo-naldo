import type { PlaywrightTestConfig } from "@playwright/test"

// Runs the suite in ./e2e against a frontend and a MO. The defaults target
// the local dev setup: frontend on :5173 (docker compose up -d), MO +
// Keycloak on :5000. CI overrides the URLs — see the E2E job in
// .gitlab-ci.yml and e2e/README.md.
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
  // The payload capture is a two-ref workflow (old ref, new ref, diff) that
  // cannot run in a single CI checkout. Excluding it instead of letting it
  // self-skip keeps the CI report skip-free: any skip is then a seed failure.
  testIgnore:
    process.env.CI && !process.env.PAYLOAD_LABEL ? ["**/payloads.spec.ts"] : [],
  reporter: process.env.CI
    ? [["list"], ["junit", { outputFile: "test-results/junit.xml" }]]
    : "list",
}

export default config
