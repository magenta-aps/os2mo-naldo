/**
 * Global setup: snapshot the clean database before any tests run.
 *
 * OS2MO exposes a testing API (when INSECURE_ENABLE_TESTING_API=true) with:
 *   POST /testing/database/snapshot  — saves the current DB state
 *   POST /testing/database/restore   — restores from that snapshot
 *
 * We snapshot once here so individual tests can restore back to the clean state.
 */
async function globalSetup() {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:5000"

  const res = await fetch(`${baseUrl}/testing/database/snapshot`, {
    method: "POST",
  })

  if (!res.ok) {
    throw new Error(`Failed to snapshot database: ${res.status} ${res.statusText}`)
  }

  console.log("Database snapshot created")
}

export default globalSetup
