export type OrgViewerSearchAddress = {
  name?: string | null
  visibility?: { scope?: string | null } | null
}

export type OrgViewerOrgUnitResult = {
  kind: "org_unit"
  uuid: string
  name: string
  addresses: OrgViewerSearchAddress[]
}

export type OrgViewerEmployeeResult = {
  kind: "employee"
  uuid: string
  name: string
  nickname: string
  addresses: OrgViewerSearchAddress[]
}

export type OrgViewerSearchResult = OrgViewerOrgUnitResult | OrgViewerEmployeeResult

const VISIBLE_SCOPES = ["INTERNAL", "PUBLIC"]

// Ported from Search.vue's result2phonenumbers - a null/missing visibility
// is treated as visible (most phone numbers have no visibility class set at
// all), only an explicitly SECRET-or-similar scope hides it.
export const visiblePhoneNumbers = (addresses: OrgViewerSearchAddress[]): string[] =>
  addresses
    .filter((a) => !a.visibility?.scope || VISIBLE_SCOPES.includes(a.visibility.scope))
    .map((a) => a.name)
    .filter((name): name is string => Boolean(name))

// Ported from Search.vue's processEmployeeResults - only people with at
// least one association or engagement are shown as results.
export const filterEmployeesWithRelations = <
  T extends { associations?: unknown[]; engagements?: unknown[] },
>(
  employees: T[]
): T[] =>
  employees.filter((e) => (e.associations?.length ?? 0) > 0 || (e.engagements?.length ?? 0) > 0)

export const sortSearchResultsByName = <T extends { name: string }>(results: T[]): T[] =>
  [...results].sort((a, b) => a.name.localeCompare(b.name))
