import { chromium, request as playwrightRequest } from "@playwright/test"
import { writeFileSync, mkdirSync } from "fs"

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5000"
const MO_URL = process.env.MO_URL ?? BASE_URL

async function waitFor(
  fn: () => Promise<boolean>,
  { attempts = 30, interval = 5_000, label = "condition" } = {}
) {
  for (let i = 1; i <= attempts; i++) {
    if (await fn()) return
    if (i === attempts) throw new Error(`Timed out waiting for ${label}`)
    console.log(`  waiting for ${label}... (${i}/${attempts})`)
    await new Promise((r) => setTimeout(r, interval))
  }
}

export default async function globalSetup() {
  mkdirSync("e2e-real/.auth", { recursive: true })

  const api = await playwrightRequest.newContext({ baseURL: MO_URL })

  // ── 1. Wait for backend ─────────────────────────────────────────────────────
  await waitFor(
    async () => {
      try {
        return (await api.get("/health/ready")).status() === 204
      } catch {
        return false
      }
    },
    { label: "/health/ready" }
  )
  await api.dispose()

  // ── 2. Login to capture Bearer token ───────────────────────────────────────
  // org_create requires authentication, so we log in before purging/seeding.
  const browser = await chromium.launch()
  const page = await browser.newPage()

  let bearerToken: string | null = null
  page.on("request", (req) => {
    if (req.url().includes("/graphql/v") && !bearerToken) {
      bearerToken = req.headers()["authorization"] ?? null
    }
  })

  await page.goto(BASE_URL)
  await page.waitForURL(/\/auth\/realms\//, { timeout: 30_000 })
  await page.fill("#username", "alvida")
  await page.fill("#password", "alvida")
  await page.click("#kc-login")
  await page.waitForURL(new RegExp(`^${BASE_URL}`), { timeout: 30_000 })
  await page.waitForSelector("#autocomplete", { timeout: 30_000 })
  await page.waitForLoadState("networkidle")

  if (!bearerToken) throw new Error("No Bearer token captured from app requests")

  writeFileSync("e2e-real/.auth/token.txt", bearerToken)
  await page.context().storageState({ path: "e2e-real/.auth/state.json" })
  await browser.close()
  console.log("  Keycloak session saved ✓")

  // ── 3. Purge DB and seed a minimal organisation ─────────────────────────────
  const apiAuth = await playwrightRequest.newContext({ baseURL: MO_URL })

  const purge = await apiAuth.post("/testing/database/purge")
  if (!purge.ok()) {
    throw new Error(`Failed to purge DB: ${purge.status()} ${await purge.text()}`)
  }
  console.log("  DB purged ✓")

  const orgRes = await apiAuth.post("/graphql/v29", {
    data: {
      query: `mutation { org_create(input: { municipality_code: null }) { uuid } }`,
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: bearerToken,
    },
  })
  const orgBody = await orgRes.json()
  if (orgBody.errors?.length) {
    throw new Error(`Failed to create organisation: ${JSON.stringify(orgBody.errors)}`)
  }
  console.log("  Organisation created ✓")

  // ── 4. Snapshot the seeded DB ───────────────────────────────────────────────
  // Each test restores from this snapshot, giving full isolation.
  const snap = await apiAuth.post("/testing/database/snapshot")
  if (!snap.ok()) {
    throw new Error(`Failed to snapshot DB: ${snap.status()} ${await snap.text()}`)
  }
  console.log("  DB snapshot taken ✓")
  await apiAuth.dispose()
}
