import { env as dynamicEnv } from "$env/dynamic/public"

const bool = (value: string | undefined, defaultValue = false): boolean => {
  if (value === "true") return true
  if (value === "false") return false
  return defaultValue
}

export const env = {
  // strings
  PUBLIC_BASE_URL: dynamicEnv["PUBLIC_BASE_URL"] ?? "http://localhost:5000",
  PUBLIC_PRIMARY_CLASS_USER_KEY:
    dynamicEnv["PUBLIC_PRIMARY_CLASS_USER_KEY"] ?? "primary",
  PUBLIC_COMMIT_TAG: dynamicEnv["PUBLIC_COMMIT_TAG"] ?? "HEAD",

  // booleans
  PUBLIC_DAR_ACCESS_ADDRESSES: bool(dynamicEnv["PUBLIC_DAR_ACCESS_ADDRESSES"], true),
  PUBLIC_DOCS_LINK: bool(dynamicEnv["PUBLIC_DOCS_LINK"], true),
  PUBLIC_SHOW_ADMIN_PANEL: bool(dynamicEnv["PUBLIC_SHOW_ADMIN_PANEL"]),
  PUBLIC_SHOW_INSIGHTS: bool(dynamicEnv["PUBLIC_SHOW_INSIGHTS"]),
  PUBLIC_AUDITLOG: bool(dynamicEnv["PUBLIC_AUDITLOG"]),
  PUBLIC_OPTIONAL_TIME_PLANNING: bool(dynamicEnv["PUBLIC_OPTIONAL_TIME_PLANNING"]),
  PUBLIC_SHOW_ROLEBINDINGS: bool(dynamicEnv["PUBLIC_SHOW_ROLEBINDINGS"]),
  PUBLIC_SEARCH_INFINITY: bool(dynamicEnv["PUBLIC_SEARCH_INFINITY"]),
  PUBLIC_ONBOARDING_LINK: bool(dynamicEnv["PUBLIC_ONBOARDING_LINK"]),
  PUBLIC_SIMPLE_SEARCH: bool(dynamicEnv["PUBLIC_SIMPLE_SEARCH"]),
  PUBLIC_SHOW_SD_CODE_IN_TREES: bool(dynamicEnv["PUBLIC_SHOW_SD_CODE_IN_TREES"]),
  PUBLIC_SHOW_JOB_FUNCTION_USER_KEY: bool(
    dynamicEnv["PUBLIC_SHOW_JOB_FUNCTION_USER_KEY"]
  ),
  PUBLIC_SHOW_EXTENSION_1: bool(dynamicEnv["PUBLIC_SHOW_EXTENSION_1"]),
  PUBLIC_SHOW_EXTENSION_2: bool(dynamicEnv["PUBLIC_SHOW_EXTENSION_2"]),
  PUBLIC_SHOW_ITUSER_CONNECTIONS: bool(dynamicEnv["PUBLIC_SHOW_ITUSER_CONNECTIONS"]),
  PUBLIC_ENABLE_CONFEDERATIONS: bool(dynamicEnv["PUBLIC_ENABLE_CONFEDERATIONS"]),
}
