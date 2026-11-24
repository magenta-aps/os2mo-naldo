import { Collection } from "$lib/graphql/types"
import type { GroupKey } from "$lib/utils/policies"

type Translate = (key: string, options: { values: Record<string, number> }) => string

const LABELS: Record<GroupKey, string> = {
  [Collection.Address]: "address",
  [Collection.Association]: "association",
  [Collection.Class]: "class",
  [Collection.Employee]: "employee",
  [Collection.Engagement]: "engagement",
  [Collection.Facet]: "facet",
  [Collection.ItSystem]: "itsystem",
  [Collection.ItUser]: "ituser",
  [Collection.Kle]: "kle",
  [Collection.Leave]: "leave",
  [Collection.Listener]: "policy_group_listener",
  [Collection.Manager]: "manager",
  [Collection.Namespace]: "policy_group_namespace",
  [Collection.Organisation]: "organisation",
  [Collection.OrganisationUnit]: "org_unit",
  [Collection.Owner]: "owner",
  [Collection.RelatedUnit]: "related_unit",
  [Collection.RoleBinding]: "rolebinding",
  [Collection.RolebindingRule]: "policy_group_rolebinding_rule",
  [Collection.RolebindingRuleRevision]: "policy_group_rolebinding_rule_revision",
  events: "policy_group_events",
  files: "policy_group_files",
  policies: "policy_group_policies",
  other: "policy_group_other",
}

export const groupLabel = (group: GroupKey, t: Translate) =>
  t(LABELS[group], { values: { n: 2 } })
