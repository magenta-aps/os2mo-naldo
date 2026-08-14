import type { OrgPersonRelation } from "$lib/env"

export type OrgViewerUnit = {
  uuid: string
  name: string
  user_key: string
  parent?: { uuid: string } | null
  org_unit_level?: { uuid: string } | null
  has_children: boolean
  child_count: number
  associations: { uuid: string }[]
  engagements: { uuid: string; engagement_type_uuid: string }[]
}

type HideFilters = {
  hideUuids: string[]
  hideNameSubstrings: string[]
  hideLevelUuids: string[]
}

// Ported from tree-store.js's filterOrgUnits - strips org units matching any
// of the three hide rules, each independently configurable per deployment.
export const filterHiddenOrgUnits = <T extends OrgViewerUnit>(
  units: T[],
  { hideUuids, hideNameSubstrings, hideLevelUuids }: HideFilters
): T[] => {
  let filtered = units

  if (hideUuids.length) {
    filtered = filtered.filter((unit) => !hideUuids.includes(unit.uuid))
  }

  if (hideNameSubstrings.length) {
    filtered = filtered.filter(
      (unit) => !hideNameSubstrings.some((substring) => unit.name.includes(substring))
    )
  }

  if (hideLevelUuids.length) {
    filtered = filtered.filter(
      (unit) =>
        !unit.org_unit_level?.uuid || !hideLevelUuids.includes(unit.org_unit_level.uuid)
    )
  }

  return filtered
}

// Ported from TreeItem.vue's sorted_org_unit_children - alphabetical, except
// uuids in `sortToBottomUuids` are always forced to the end of the list.
export const sortSiblings = <T extends { uuid: string; name: string }>(
  units: T[],
  sortToBottomUuids: string[]
): T[] =>
  [...units].sort((x, y) => {
    if (sortToBottomUuids.length) {
      if (sortToBottomUuids.includes(x.uuid)) return 1
      if (sortToBottomUuids.includes(y.uuid)) return -1
    }
    const a = x.name.toUpperCase()
    const b = y.name.toUpperCase()
    return a === b ? 0 : a > b ? 1 : -1
  })

export type PersonCounts = {
  engagements?: number
  associations?: number
}

// Ported from OrganisationLite.vue's computePersonCounts - counts are only
// computed for the relation kind(s) this deployment cares about, and
// engagements can additionally be filtered by type (e.g. to exclude a
// "student" engagement type from headcount).
export const computePersonCounts = (
  unit: Pick<OrgViewerUnit, "engagements" | "associations">,
  relationType: OrgPersonRelation,
  removeEngagementTypeUuids: string[]
): PersonCounts => {
  const counts: PersonCounts = {}

  if (relationType === "engagement" || relationType === "both") {
    let engagements = unit.engagements
    if (removeEngagementTypeUuids.length) {
      engagements = engagements.filter(
        (e) => !removeEngagementTypeUuids.includes(e.engagement_type_uuid)
      )
    }
    counts.engagements = engagements.length
  }

  if (relationType === "association" || relationType === "both") {
    counts.associations = unit.associations.length
  }

  return counts
}
