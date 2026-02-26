import type { Handle } from "@sveltejs/kit"
import { handle as authHandle } from "./auth"
import { sequence } from "@sveltejs/kit/hooks"
import { locale } from "svelte-i18n"

const localeHandle: Handle = async ({ event, resolve }) => {
  const lang = event.request.headers.get("accept-language")?.split(",")[0]
  if (lang) {
    locale.set(lang)
  }
  return resolve(event)
}

export const handle = sequence(authHandle, localeHandle)
