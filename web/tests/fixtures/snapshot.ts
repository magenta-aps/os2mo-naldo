import { test as base, APIRequestContext } from "@playwright/test"

export const test = base.extend<{
  snapshot
}>({
  snapshot: async ({ request }, use) => {
    const snap = await request.post(`http://localhost:5000/testing/database/snapshot`)
    console.log(snap)
    console.log(snap.ok())

    if (!snap.ok()) throw new Error("Snapshot failed")
    await use() // run the test
    const restore = await request.post(`http://localhost:5000/testing/database/restore`)
    console.log(restore)
    console.log(restore.ok())
    if (!restore.ok()) throw new Error("Restore failed")
  },
})
