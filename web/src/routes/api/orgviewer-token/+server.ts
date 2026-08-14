import { getServiceToken } from "$lib/server/orgviewerAuth"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async () => {
  const token = await getServiceToken()
  const expiresIn = Math.max(0, Math.round((token.expiresAt - Date.now()) / 1000))

  return json({ access_token: token.access_token, expires_in: expiresIn })
}
