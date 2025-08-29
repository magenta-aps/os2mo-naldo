import * as staticEnv from "$env/static/public"

const bool = (value: string | undefined, defaultValue = false): boolean => {
  if (value === "true") return true
  if (value === "false") return false
  return defaultValue
}

export const env = {
  // strings
  PUBLIC_BASE_URL: staticEnv.PUBLIC_BASE_URL ?? "http://localhost:5000",
  PUBLIC_PRIMARY_CLASS_USER_KEY: staticEnv.PUBLIC_PRIMARY_CLASS_USER_KEY ?? "primary",
  PUBLIC_COMMIT_TAG: staticEnv.PUBLIC_COMMIT_TAG ?? "HEAD",

  // booleans
  PUBLIC_DAR_ACCESS_ADDRESSES: bool(staticEnv.PUBLIC_DAR_ACCESS_ADDRESSES, true),
  PUBLIC_SHOW_ADMIN_PANEL: bool(staticEnv.PUBLIC_SHOW_ADMIN_PANEL, false),
  PUBLIC_SHOW_INSIGHTS: bool(staticEnv.PUBLIC_SHOW_INSIGHTS, false),
  PUBLIC_AUDITLOG: bool(staticEnv.PUBLIC_AUDITLOG, false),
  PUBLIC_OPTIONAL_TIME_PLANNING: bool(staticEnv.PUBLIC_OPTIONAL_TIME_PLANNING, false),
  PUBLIC_SHOW_ROLEBINDINGS: bool(staticEnv.PUBLIC_SHOW_ROLEBINDINGS, false),
  PUBLIC_SEARCH_INFINITY: bool(staticEnv.PUBLIC_SEARCH_INFINITY, false),
  PUBLIC_DOCS_LINK: bool(staticEnv.PUBLIC_DOCS_LINK, true),
  PUBLIC_ONBOARDING_LINK: bool(staticEnv.PUBLIC_ONBOARDING_LINK, false),
  PUBLIC_SIMPLE_SEARCH: bool(staticEnv.PUBLIC_SIMPLE_SEARCH, false),
  PUBLIC_SHOW_SD_CODE_IN_TREES: bool(staticEnv.PUBLIC_SHOW_SD_CODE_IN_TREES, false),
  PUBLIC_SHOW_JOB_FUNCTION_USER_KEY: bool(
    staticEnv.PUBLIC_SHOW_JOB_FUNCTION_USER_KEY,
    false
  ),
  PUBLIC_SHOW_EXTENSION_1: bool(staticEnv.PUBLIC_SHOW_EXTENSION_1, false),
  PUBLIC_SHOW_EXTENSION_2: bool(staticEnv.PUBLIC_SHOW_EXTENSION_2, false),
}
