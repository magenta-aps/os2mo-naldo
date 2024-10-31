import { browser } from "$app/environment"
import "$lib/i18n" // Import to initialize. Important :)
import { locale, waitLocale } from "svelte-i18n"
import type { LayoutLoad } from "./$types"
import { redirect } from "@sveltejs/kit"
import { env } from "$env/dynamic/public"

export const load: LayoutLoad = async ({ url }) => {
  // Redirect if not true
  if (env.PUBLIC_SHOW_INSIGHTS !== "true" && url.pathname.includes("insights")) {
    throw redirect(302, "/")
  }
  // Redirect if not true
  if (env.PUBLIC_SHOW_ADMIN_PANEL !== "true" && url.pathname.includes("admin")) {
    throw redirect(302, "/")
  }
  if (browser) {
    locale.set(window.navigator.language)
  }
  await waitLocale()
}
