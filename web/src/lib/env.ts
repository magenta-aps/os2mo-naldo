import { env as dynamicEnv } from "$env/dynamic/public"

export const bool = (value: string | undefined, defaultValue = false): boolean => {
  if (!value) return defaultValue
  if (value === "true") return true
  if (value === "false") return false
  throw new Error(`Invalid boolean env var: "${value}". Must be "true" or "false"`)
}

export type Environment = "dev" | "test" | "prod"
const VALID_ENVIRONMENTS: Environment[] = ["dev", "test", "prod"]

export const environment = (
  value: string | undefined,
  defaultValue: Environment = "dev"
): Environment => {
  if (!value) return defaultValue
  if (VALID_ENVIRONMENTS.includes(value as Environment)) return value as Environment
  throw new Error(
    `Invalid PUBLIC_ENVIRONMENT: "${value}". Must be one of: ${VALID_ENVIRONMENTS.join(
      ", "
    )}`
  )
}

export const json = <T>(value: string | undefined, defaultValue: T): T => {
  if (!value) return defaultValue
  try {
    return JSON.parse(value) as T
  } catch (err) {
    throw new Error(`Invalid JSON in env var: "${value}"`)
  }
}

export type OrgviewerTreeLayout = "horizontal" | "hybrid" | "vertical"
const VALID_TREE_LAYOUTS: OrgviewerTreeLayout[] = ["horizontal", "hybrid", "vertical"]

export const treeLayout = (
  value: string | undefined,
  defaultValue: OrgviewerTreeLayout = "vertical"
): OrgviewerTreeLayout => {
  if (!value) return defaultValue
  if (VALID_TREE_LAYOUTS.includes(value as OrgviewerTreeLayout))
    return value as OrgviewerTreeLayout
  throw new Error(
    `Invalid PUBLIC_ORGVIEWER_TREE_LAYOUT: "${value}". Must be one of: ${VALID_TREE_LAYOUTS.join(
      ", "
    )}`
  )
}

export type OrgPersonRelation = "engagement" | "association" | "both"
const VALID_ORG_PERSON_RELATIONS: OrgPersonRelation[] = [
  "engagement",
  "association",
  "both",
]

export const personRelation = (
  value: string | undefined,
  defaultValue: OrgPersonRelation = "engagement"
): OrgPersonRelation => {
  if (!value) return defaultValue
  if (VALID_ORG_PERSON_RELATIONS.includes(value as OrgPersonRelation))
    return value as OrgPersonRelation
  throw new Error(
    `Invalid PUBLIC_ORGVIEWER_ORG_PERSON_RELATION: "${value}". Must be one of: ${VALID_ORG_PERSON_RELATIONS.join(
      ", "
    )}`
  )
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

  // Keycloak config. When URL/realm/client are unset, the app starts with no
  // authentication.
  PUBLIC_KEYCLOAK_URL: dynamicEnv["PUBLIC_KEYCLOAK_URL"] ?? "",
  PUBLIC_KEYCLOAK_REALM: dynamicEnv["PUBLIC_KEYCLOAK_REALM"] ?? "",
  PUBLIC_KEYCLOAK_CLIENT_ID: dynamicEnv["PUBLIC_KEYCLOAK_CLIENT_ID"] ?? "",

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
  PUBLIC_ENVIRONMENT: environment(dynamicEnv["PUBLIC_ENVIRONMENT"]),

  // orgviewer: a public, unauthenticated read-only org-chart viewer ported
  // from the standalone os2orgviewer app, mounted under /orgviewer. Kept in
  // its own PUBLIC_ORGVIEWER_* namespace so its deploy config stays
  // independent of the rest of this app's PUBLIC_SHOW_*/PUBLIC_ENABLE_* flags.
  PUBLIC_ORGVIEWER_ROOT_UUID: dynamicEnv["PUBLIC_ORGVIEWER_ROOT_UUID"] ?? "",
  PUBLIC_ORGVIEWER_TITLE: dynamicEnv["PUBLIC_ORGVIEWER_TITLE"] ?? "OS2mo Orgviewer",
  PUBLIC_ORGVIEWER_TREE_LAYOUT: treeLayout(dynamicEnv["PUBLIC_ORGVIEWER_TREE_LAYOUT"]),
  PUBLIC_ORGVIEWER_ORG_PERSON_RELATION: personRelation(
    dynamicEnv["PUBLIC_ORGVIEWER_ORG_PERSON_RELATION"]
  ),
  PUBLIC_ORGVIEWER_HIDE_ORG_UNIT_UUIDS: json<string[]>(
    dynamicEnv["PUBLIC_ORGVIEWER_HIDE_ORG_UNIT_UUIDS"],
    []
  ),
  PUBLIC_ORGVIEWER_HIDE_ORG_UNITS_BY_NAME: json<string[]>(
    dynamicEnv["PUBLIC_ORGVIEWER_HIDE_ORG_UNITS_BY_NAME"],
    []
  ),
  PUBLIC_ORGVIEWER_HIDE_ORG_UNIT_LEVELS: json<string[]>(
    dynamicEnv["PUBLIC_ORGVIEWER_HIDE_ORG_UNIT_LEVELS"],
    []
  ),
  PUBLIC_ORGVIEWER_SORT_SPECIFIC_UNITS_TO_BOTTOM: json<string[]>(
    dynamicEnv["PUBLIC_ORGVIEWER_SORT_SPECIFIC_UNITS_TO_BOTTOM"],
    []
  ),
  PUBLIC_ORGVIEWER_REMOVE_ENGAGEMENT_TYPE_UUID: json<string[]>(
    dynamicEnv["PUBLIC_ORGVIEWER_REMOVE_ENGAGEMENT_TYPE_UUID"],
    []
  ),
  PUBLIC_ORGVIEWER_REMOVE_CHILDREN_COUNT: bool(
    dynamicEnv["PUBLIC_ORGVIEWER_REMOVE_CHILDREN_COUNT"]
  ),
  PUBLIC_ORGVIEWER_REMOVE_PERSON_COUNT: bool(
    dynamicEnv["PUBLIC_ORGVIEWER_REMOVE_PERSON_COUNT"]
  ),
  PUBLIC_ORGVIEWER_REMOVE_MANAGER_ENGAGEMENT: bool(
    dynamicEnv["PUBLIC_ORGVIEWER_REMOVE_MANAGER_ENGAGEMENT"]
  ),
  PUBLIC_ORGVIEWER_REMOVE_ORG_UNIT_EMAIL: bool(
    dynamicEnv["PUBLIC_ORGVIEWER_REMOVE_ORG_UNIT_EMAIL"]
  ),
  PUBLIC_ORGVIEWER_HIDDEN_ADDRESS_TYPE_USER_KEYS: json<string[]>(
    dynamicEnv["PUBLIC_ORGVIEWER_HIDDEN_ADDRESS_TYPE_USER_KEYS"],
    []
  ),
  PUBLIC_ORGVIEWER_SHOW_NICKNAME: bool(dynamicEnv["PUBLIC_ORGVIEWER_SHOW_NICKNAME"]),
  PUBLIC_ORGVIEWER_SHOW_EXTENSION_1: bool(dynamicEnv["PUBLIC_ORGVIEWER_SHOW_EXTENSION_1"]),
  PUBLIC_ORGVIEWER_SHOW_EXTENSION_3_VIBORG: bool(
    dynamicEnv["PUBLIC_ORGVIEWER_SHOW_EXTENSION_3_VIBORG"]
  ),
}
