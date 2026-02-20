import { env as dynamicEnv } from "$env/dynamic/public"

const bool = (value: string | undefined, defaultValue = false): boolean => {
  if (value === "true") return true
  if (value === "false") return false
  return defaultValue
}

const json = <T>(value: string | undefined, defaultValue: T): T => {
  if (!value) return defaultValue
  try {
    return JSON.parse(value) as T
  } catch (err) {
    console.error(`Invalid JSON in env var:`, value)
    return defaultValue
  }
}

export const env = {
  // lists
  PUBLIC_NAVLINKS: json<{ href: string; text: string }[]>(
    dynamicEnv["PUBLIC_NAVLINKS"],
    []
  ),
  PUBLIC_SUBSTITUTE_ROLES: json<string[]>(dynamicEnv["PUBLIC_SUBSTITUTE_ROLES"], []), // strings
  PUBLIC_BASE_URL: dynamicEnv["PUBLIC_BASE_URL"] ?? "http://localhost:5000",
  PUBLIC_PRIMARY_CLASS_USER_KEY:
    dynamicEnv["PUBLIC_PRIMARY_CLASS_USER_KEY"] ?? "primary",
  PUBLIC_COMMIT_TAG: dynamicEnv["PUBLIC_COMMIT_TAG"] ?? "HEAD",

  // booleans
  PUBLIC_DAR_ACCESS_ADDRESSES: bool(dynamicEnv["PUBLIC_DAR_ACCESS_ADDRESSES"], true),
  PUBLIC_DOCS_LINK: bool(dynamicEnv["PUBLIC_DOCS_LINK"], true),
  PUBLIC_INHERIT_MANAGER: bool(dynamicEnv["PUBLIC_INHERIT_MANAGER"], true),
  // Consider default false cpr_number maybe?
  PUBLIC_SHOW_CPR_NUMBER: bool(dynamicEnv["PUBLIC_SHOW_CPR_NUMBER"], true),
  PUBLIC_SHOW_ORG_UNIT_LEVEL: bool(dynamicEnv["PUBLIC_SHOW_ORG_UNIT_LEVEL"], true),

  PUBLIC_SHOW_TIME_PLANNING: bool(dynamicEnv["PUBLIC_SHOW_TIME_PLANNING"]),
  PUBLIC_SHOW_KLE: bool(dynamicEnv["PUBLIC_SHOW_KLE"]),
  PUBLIC_SHOW_PRIMARY_ENGAGEMENT: bool(dynamicEnv["PUBLIC_SHOW_PRIMARY_ENGAGEMENT"]),
  PUBLIC_SHOW_PRIMARY_ASSOCIATION: bool(dynamicEnv["PUBLIC_SHOW_PRIMARY_ASSOCIATION"]),
  PUBLIC_SHOW_IT_ASSOCIATIONS_TAB: bool(dynamicEnv["PUBLIC_SHOW_IT_ASSOCIATIONS_TAB"]),
  PUBLIC_DISABLE_IT_USER_EDIT_FORM: bool(
    dynamicEnv["PUBLIC_DISABLE_IT_USER_EDIT_FORM"]
  ),
  PUBLIC_SHOW_EMPLOYEE_BIRTHDAY_IN_SEARCH: bool(
    dynamicEnv["PUBLIC_SHOW_EMPLOYEE_BIRTHDAY_IN_SEARCH"]
  ),
  PUBLIC_SHOW_ADMIN_PANEL: bool(dynamicEnv["PUBLIC_SHOW_ADMIN_PANEL"]),
  PUBLIC_SHOW_INSIGHTS: bool(dynamicEnv["PUBLIC_SHOW_INSIGHTS"]),
  PUBLIC_SHOW_ROLEBINDINGS: bool(dynamicEnv["PUBLIC_SHOW_ROLEBINDINGS"]),
  PUBLIC_SEARCH_INFINITY: bool(dynamicEnv["PUBLIC_SEARCH_INFINITY"]),
  PUBLIC_ONBOARDING_LINK: bool(dynamicEnv["PUBLIC_ONBOARDING_LINK"]),
  PUBLIC_SHOW_SD_CODE_IN_TREES: bool(dynamicEnv["PUBLIC_SHOW_SD_CODE_IN_TREES"]),
  PUBLIC_SHOW_JOB_FUNCTION_USER_KEY: bool(
    dynamicEnv["PUBLIC_SHOW_JOB_FUNCTION_USER_KEY"]
  ),
  PUBLIC_SHOW_EXTENSION_1: bool(dynamicEnv["PUBLIC_SHOW_EXTENSION_1"]),
  PUBLIC_SHOW_EXTENSION_4: bool(dynamicEnv["PUBLIC_SHOW_EXTENSION_4"]),
  PUBLIC_SHOW_ITUSER_CONNECTIONS: bool(dynamicEnv["PUBLIC_SHOW_ITUSER_CONNECTIONS"]),
  PUBLIC_ENABLE_CONFEDERATIONS: bool(dynamicEnv["PUBLIC_ENABLE_CONFEDERATIONS"]),
  PUBLIC_ENABLE_CLASS_TERMINATION: bool(dynamicEnv["PUBLIC_ENABLE_CLASS_TERMINATION"]),
  PUBLIC_SKATTESTYRELSEN_USERFLOW: bool(dynamicEnv["PUBLIC_SKATTESTYRELSEN_USERFLOW"]),
  PUBLIC_ENABLE_SP: bool(dynamicEnv["PUBLIC_ENABLE_SP"]),
  PUBLIC_ENABLE_RSD_SEARCH: bool(dynamicEnv["PUBLIC_ENABLE_RSD_SEARCH"]),
  PUBLIC_ENABLE_THEMING: bool(dynamicEnv["PUBLIC_ENABLE_THEMING"]),
}
