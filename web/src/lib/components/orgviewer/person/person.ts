import type { OrgPersonRelation } from "$lib/env"
import type { OrgViewerAddress } from "$lib/components/orgviewer/organisation"

export type PersonEmployeeRef = { uuid: string; name: string; nickname: string }

export type PersonEngagement = {
  org_unit_uuid: string
  engagement_type: { name: string }
  job_function: { name: string }
  extension_1?: string | null
  extension_3?: string | null
}

export type PersonAssociation = {
  org_unit_uuid: string
  association_type: { name: string }
  substitute: PersonEmployeeRef[]
  dynamic_class?: { name: string; parent?: { name: string } | null } | null
}

export type PersonDetail = {
  uuid: string
  name: string
  nickname: string
  addresses: OrgViewerAddress[]
  engagements: PersonEngagement[]
  associations: PersonAssociation[]
}

// Ported from Person.vue's `person` watcher / beforeRouteEnter: when the
// URL doesn't already carry an org unit context, pick one from the
// person's own relations to redirect to. For relationType "both", the app
// had two inconsistent implementations (beforeRouteEnter preferred the
// engagement's org unit, the reactive watcher preferred the association's) -
// this follows beforeRouteEnter's engagement-first order, since that's the
// path exercised on every direct/initial page load.
export const resolveOrgUnitUuid = (
  person: {
    engagements: { org_unit_uuid: string }[]
    associations: { org_unit_uuid: string }[]
  },
  relationType: OrgPersonRelation
): string | undefined => {
  if (relationType === "association") return person.associations[0]?.org_unit_uuid
  if (relationType === "engagement") return person.engagements[0]?.org_unit_uuid
  return person.engagements[0]?.org_unit_uuid ?? person.associations[0]?.org_unit_uuid
}

// Ported from Person.vue's `engagement`/`association` computed properties:
// when an org unit context IS given, look it up with no fallback (a person
// viewed under an org unit they have no relation to shows nothing, rather
// than silently substituting an unrelated relation); when none is given,
// default to the first relation.
export const findRelationForOrgUnit = <T extends { org_unit_uuid: string }>(
  relations: T[],
  orgUnitUuid: string | undefined
): T | undefined =>
  orgUnitUuid ? relations.find((r) => r.org_unit_uuid === orgUnitUuid) : relations[0]
