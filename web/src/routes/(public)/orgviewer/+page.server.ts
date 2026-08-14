import { env } from "$lib/env"
import { error, redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
  if (!env.PUBLIC_ORGVIEWER_ROOT_UUID) {
    throw error(500, "PUBLIC_ORGVIEWER_ROOT_UUID is not configured")
  }

  throw redirect(
    302,
    `/orgviewer/tree/${env.PUBLIC_ORGVIEWER_ROOT_UUID}/${env.PUBLIC_ORGVIEWER_ROOT_UUID}`
  )
}
