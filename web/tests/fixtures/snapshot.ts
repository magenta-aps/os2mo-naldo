import { test as base, APIRequestContext } from "@playwright/test"

export const test = base.extend<{
  snapshot
  moClient
}>({
  moClient: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: "http://localhost:5000",
    })
    await use(request)
    await request.dispose()
  },

  snapshot: async ({ moClient }, use) => {
    const snap = await moClient.post("/testing/database/snapshot")
    console.log(snap)

    if (!snap.ok()) throw new Error("Snapshot failed")

    await use()

    const restore = await moClient.post("/testing/database/restore")
    if (!restore.ok()) throw new Error("Restore failed")
  },
})
