import { browser } from "$app/environment"
import { init, register } from "svelte-i18n"

const defaultLocale = "da"

register("da", () => import("$lib/i18n/da.json"))
register("en", () => import("$lib/i18n/en.json"))
register("en-US", () => import("$lib/i18n/en.json"))

init({
  fallbackLocale: defaultLocale,
  initialLocale: browser ? window.navigator.language : defaultLocale,
})
