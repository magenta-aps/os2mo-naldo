export type OrgViewerEmployee = {
  uuid: string
  name: string
  nickname: string
  manager_roles: { uuid: string }[]
}

export type OrgViewerAddress = {
  uuid: string
  name?: string | null
  value: string
  visibility?: { name: string } | null
  address_type: { uuid: string; name: string; user_key: string; scope: string }
}

export type OrgViewerManager = {
  org_unit_uuid: string
  manager_type: { uuid: string; name: string }
  employee: OrgViewerEmployee[]
}

export type OrgViewerAssociation = {
  association_type: { name: string }
  employee: OrgViewerEmployee[]
  substitute: OrgViewerEmployee[]
  dynamic_class?: { name: string; parent?: { name: string } | null } | null
}

export type OrgViewerEngagement = {
  org_unit_uuid: string
  engagement_type_uuid: string
  employee: OrgViewerEmployee[]
  job_function?: { name: string } | null
  extension_1?: string | null
  extension_3?: string | null
}

// Ported from organisation-store.js's sortAssociations. Comment from the
// original: "these weighted criteria might be unique for Frederikshavn
// Kommune and probably should be configurable" - kept as-is rather than
// made configurable, since no deployment has asked for that yet.
const ASSOCIATION_TYPE_WEIGHT: Record<string, number> = {
  Formand: 10,
  "LR, formand": 10,
  LR: 9,
  "FTR, næstformand": 8,
  "TR, næstformand": 8,
  "Medarb.rep, næstformand": 8,
  FTR: 7,
  TR: 6,
  "Medarb.rep": 5,
  "AMR, næstformand": 4,
  Næstformand: 4,
  AMR: 3,
  Leder: 2,
  Projektleder: 1,
}

export const sortAssociations = <T extends OrgViewerAssociation>(
  associations: T[]
): T[] =>
  [...associations].sort(
    (a, b) =>
      (ASSOCIATION_TYPE_WEIGHT[b.association_type.name] ?? 0) -
      (ASSOCIATION_TYPE_WEIGHT[a.association_type.name] ?? 0)
  )

const displayName = (employee: OrgViewerEmployee | undefined, showNickname: boolean) =>
  (showNickname && employee?.nickname) || employee?.name || ""

// Ported from organisation-store.js's sortByName - alphabetical by the
// first employee's nickname (if enabled and present) or name.
export const sortByName = <T extends { employee: OrgViewerEmployee[] }>(
  people: T[],
  showNickname: boolean
): T[] =>
  [...people].sort((x, y) => {
    const a = displayName(x.employee[0], showNickname)
    const b = displayName(y.employee[0], showNickname)
    return a === b ? 0 : a > b ? 1 : -1
  })

// Ported from organisation-store.js's getOrgUnitData getter - when
// `remove_manager_engagement` is set, managers are shown only in the
// dedicated Managers section, not duplicated in the plain engagement list.
export const filterManagersOutOfEngagements = <T extends OrgViewerEngagement>(
  engagements: T[],
  removeManagerEngagement: boolean
): T[] =>
  removeManagerEngagement
    ? engagements.filter((e) => !e.employee[0]?.manager_roles.length)
    : engagements

// Ported from PersonList.vue's display_people - only applied to engagements
// (never to associations, which have no engagement_type_uuid).
export const filterEngagementsByType = <T extends OrgViewerEngagement>(
  engagements: T[],
  removeEngagementTypeUuids: string[]
): T[] =>
  removeEngagementTypeUuids.length
    ? engagements.filter((e) => !removeEngagementTypeUuids.includes(e.engagement_type_uuid))
    : engagements

// Ported from AddressList.vue's visible_addresses plus its inline
// visibility/EmailUnit rules.
export const filterVisibleAddresses = <T extends OrgViewerAddress>(
  addresses: T[],
  { hiddenUserKeys, removeOrgUnitEmail }: { hiddenUserKeys: string[]; removeOrgUnitEmail: boolean }
): T[] =>
  addresses.filter((address) => {
    if (address.visibility?.name === "Hemmelig") return false
    if (hiddenUserKeys.includes(address.address_type.user_key)) return false
    if (removeOrgUnitEmail && address.address_type.user_key === "EmailUnit") return false
    return true
  })

export { displayName as employeeDisplayName }
