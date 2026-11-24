import {
  Collection,
  GraphQlVersion,
  Mutator,
  PolicySelectorKind,
  type PolicyStateInput,
} from "$lib/graphql/types"
import { celSyntaxError } from "$lib/utils/cel"

// The version the frontend speaks (see `$lib/http/client.ts`). New rules are
// written in it, so their condition filters match the schema the editor
// introspects for field names.
export const POLICY_GRAPHQL_VERSION = GraphQlVersion.Version_29

// A group is one row of the permission grid: a collection with the mutators
// that write it, or mutators without a collection of their own.
export type GroupKey = Collection | "events" | "policies" | "files" | "other"

export const MUTATOR_GROUPS: Record<Mutator, GroupKey> = {
  [Mutator.AddressCreate]: Collection.Address,
  [Mutator.AddressDelete]: Collection.Address,
  [Mutator.AddressRefresh]: Collection.Address,
  [Mutator.AddressTerminate]: Collection.Address,
  [Mutator.AddressUpdate]: Collection.Address,
  [Mutator.AddressesCreate]: Collection.Address,
  [Mutator.AssociationCreate]: Collection.Association,
  [Mutator.AssociationDelete]: Collection.Association,
  [Mutator.AssociationRefresh]: Collection.Association,
  [Mutator.AssociationTerminate]: Collection.Association,
  [Mutator.AssociationUpdate]: Collection.Association,
  [Mutator.ItassociationCreate]: Collection.Association,
  [Mutator.ItassociationTerminate]: Collection.Association,
  [Mutator.ItassociationUpdate]: Collection.Association,
  [Mutator.ClassCreate]: Collection.Class,
  [Mutator.ClassDelete]: Collection.Class,
  [Mutator.ClassRefresh]: Collection.Class,
  [Mutator.ClassTerminate]: Collection.Class,
  [Mutator.ClassUpdate]: Collection.Class,
  [Mutator.EmployeeCreate]: Collection.Employee,
  [Mutator.EmployeeDelete]: Collection.Employee,
  [Mutator.EmployeeRefresh]: Collection.Employee,
  [Mutator.EmployeeTerminate]: Collection.Employee,
  [Mutator.EmployeeUpdate]: Collection.Employee,
  [Mutator.EngagementCreate]: Collection.Engagement,
  [Mutator.EngagementDelete]: Collection.Engagement,
  [Mutator.EngagementRefresh]: Collection.Engagement,
  [Mutator.EngagementTerminate]: Collection.Engagement,
  [Mutator.EngagementUpdate]: Collection.Engagement,
  [Mutator.EngagementsCreate]: Collection.Engagement,
  [Mutator.EngagementsUpdate]: Collection.Engagement,
  [Mutator.EventAcknowledge]: "events",
  [Mutator.EventRerun]: "events",
  [Mutator.EventSend]: "events",
  [Mutator.EventSilence]: "events",
  [Mutator.EventUnsilence]: "events",
  [Mutator.EventListenerDeclare]: Collection.Listener,
  [Mutator.EventListenerDelete]: Collection.Listener,
  [Mutator.EventNamespaceDeclare]: Collection.Namespace,
  [Mutator.EventNamespaceDelete]: Collection.Namespace,
  [Mutator.FacetCreate]: Collection.Facet,
  [Mutator.FacetDelete]: Collection.Facet,
  [Mutator.FacetRefresh]: Collection.Facet,
  [Mutator.FacetTerminate]: Collection.Facet,
  [Mutator.FacetUpdate]: Collection.Facet,
  [Mutator.ItsystemCreate]: Collection.ItSystem,
  [Mutator.ItsystemDelete]: Collection.ItSystem,
  [Mutator.ItsystemRefresh]: Collection.ItSystem,
  [Mutator.ItsystemTerminate]: Collection.ItSystem,
  [Mutator.ItsystemUpdate]: Collection.ItSystem,
  [Mutator.ItuserCreate]: Collection.ItUser,
  [Mutator.ItuserDelete]: Collection.ItUser,
  [Mutator.ItuserRefresh]: Collection.ItUser,
  [Mutator.ItuserTerminate]: Collection.ItUser,
  [Mutator.ItuserUpdate]: Collection.ItUser,
  [Mutator.ItusersCreate]: Collection.ItUser,
  [Mutator.KleCreate]: Collection.Kle,
  [Mutator.KleDelete]: Collection.Kle,
  [Mutator.KleRefresh]: Collection.Kle,
  [Mutator.KleTerminate]: Collection.Kle,
  [Mutator.KleUpdate]: Collection.Kle,
  [Mutator.LeaveCreate]: Collection.Leave,
  [Mutator.LeaveDelete]: Collection.Leave,
  [Mutator.LeaveRefresh]: Collection.Leave,
  [Mutator.LeaveTerminate]: Collection.Leave,
  [Mutator.LeaveUpdate]: Collection.Leave,
  [Mutator.ManagerCreate]: Collection.Manager,
  [Mutator.ManagerDelete]: Collection.Manager,
  [Mutator.ManagerRefresh]: Collection.Manager,
  [Mutator.ManagerTerminate]: Collection.Manager,
  [Mutator.ManagerUpdate]: Collection.Manager,
  [Mutator.ManagersCreate]: Collection.Manager,
  [Mutator.OrgCreate]: Collection.Organisation,
  [Mutator.OrgUnitCreate]: Collection.OrganisationUnit,
  [Mutator.OrgUnitDelete]: Collection.OrganisationUnit,
  [Mutator.OrgUnitRefresh]: Collection.OrganisationUnit,
  [Mutator.OrgUnitTerminate]: Collection.OrganisationUnit,
  [Mutator.OrgUnitUpdate]: Collection.OrganisationUnit,
  [Mutator.OwnerCreate]: Collection.Owner,
  [Mutator.OwnerDelete]: Collection.Owner,
  [Mutator.OwnerRefresh]: Collection.Owner,
  [Mutator.OwnerTerminate]: Collection.Owner,
  [Mutator.OwnerUpdate]: Collection.Owner,
  [Mutator.PolicyDeclare]: "policies",
  [Mutator.RelatedUnitRefresh]: Collection.RelatedUnit,
  [Mutator.RelatedUnitsUpdate]: Collection.RelatedUnit,
  [Mutator.RolebindingCreate]: Collection.RoleBinding,
  [Mutator.RolebindingDelete]: Collection.RoleBinding,
  [Mutator.RolebindingRefresh]: Collection.RoleBinding,
  [Mutator.RolebindingTerminate]: Collection.RoleBinding,
  [Mutator.RolebindingUpdate]: Collection.RoleBinding,
  [Mutator.RolebindingsCreate]: Collection.RoleBinding,
  [Mutator.RolebindingRuleCreate]: Collection.RolebindingRule,
  [Mutator.RolebindingRuleDelete]: Collection.RolebindingRule,
  [Mutator.RolebindingRuleUpdate]: Collection.RolebindingRule,
  [Mutator.UploadFile]: "files",
}

// Collections and mutators MO adds after the frontend's schema still show up,
// in the "other" group, so editing a policy never drops a rule.
export const groupOfMutator = (mutator: string): GroupKey =>
  MUTATOR_GROUPS[mutator as Mutator] ?? "other"

export const groupOfCollection = (collection: string): GroupKey =>
  Object.values(Collection).includes(collection as Collection)
    ? (collection as Collection)
    : "other"

export const GROUPS: GroupKey[] = [
  ...Object.values(Collection),
  "events",
  "files",
  "policies",
]

export const mutatorsOf = (group: GroupKey): string[] =>
  Object.values(Mutator).filter((mutator) => MUTATOR_GROUPS[mutator] === group)

export type ReadGrant = {
  id: number
  collection: string
  fields: string[]
  condition: string
  graphql_version: GraphQlVersion
}

// Write rules with one condition share a grant, so the grid can show a
// collection's mutators as one set of checkboxes. A grant expands to one
// write rule per mutator.
export type WriteGrant = {
  id: number
  group: GroupKey
  mutators: string[]
  condition: string
  graphql_version: GraphQlVersion
}

export type PolicyDraft = {
  uuid: string
  name: string
  description: string
  active: boolean
  managed: boolean
  roles: string[]
  // Selectors of kinds the editor does not show, kept as they are
  otherSelectors: { kind: PolicySelectorKind; value: string }[]
  reads: ReadGrant[]
  writes: WriteGrant[]
}

type PolicyIn = {
  uuid: string
  name: string
  description: string
  active: boolean
  managed: boolean
  selectors: { kind: PolicySelectorKind; value: string }[]
  read_rules: {
    collection: string
    fields: string[]
    condition: string
    graphql_version: GraphQlVersion
  }[]
  write_rules: { mutator: string; condition: string; graphql_version: GraphQlVersion }[]
}

let nextId = 0
export const grantId = () => ++nextId

export const emptyDraft = (uuid: string): PolicyDraft => ({
  uuid,
  name: "",
  description: "",
  active: true,
  managed: false,
  roles: [],
  otherSelectors: [],
  reads: [],
  writes: [],
})

export const newReadGrant = (collection: string): ReadGrant => ({
  id: grantId(),
  collection,
  fields: [],
  condition: "true",
  graphql_version: POLICY_GRAPHQL_VERSION,
})

export const newWriteGrant = (group: GroupKey): WriteGrant => ({
  id: grantId(),
  group,
  mutators: [],
  condition: "true",
  graphql_version: POLICY_GRAPHQL_VERSION,
})

export const fromPolicy = (policy: PolicyIn): PolicyDraft => {
  const writes = new Map<string, WriteGrant>()
  for (const rule of policy.write_rules) {
    const group = groupOfMutator(rule.mutator)
    const key = JSON.stringify([group, rule.condition, rule.graphql_version])
    const grant = writes.get(key)
    if (grant) {
      if (!grant.mutators.includes(rule.mutator)) grant.mutators.push(rule.mutator)
    } else {
      writes.set(key, {
        id: grantId(),
        group,
        mutators: [rule.mutator],
        condition: rule.condition,
        graphql_version: rule.graphql_version,
      })
    }
  }
  return {
    uuid: policy.uuid,
    name: policy.name,
    description: policy.description,
    active: policy.active,
    managed: policy.managed,
    roles: policy.selectors
      .filter((s) => s.kind === PolicySelectorKind.Role)
      .map((s) => s.value),
    otherSelectors: policy.selectors.filter((s) => s.kind !== PolicySelectorKind.Role),
    reads: policy.read_rules.map((rule) => ({
      id: grantId(),
      collection: rule.collection,
      fields: [...rule.fields],
      condition: rule.condition,
      graphql_version: rule.graphql_version,
    })),
    writes: [...writes.values()],
  }
}

export const toState = (draft: PolicyDraft): PolicyStateInput => ({
  name: draft.name.trim(),
  description: draft.description,
  active: draft.active,
  selectors: [
    ...draft.roles.map((value) => ({ kind: PolicySelectorKind.Role, value })),
    ...draft.otherSelectors,
  ],
  // A grant without fields or mutators grants nothing, so it is no rule at all
  read_rules: draft.reads
    .filter((grant) => grant.fields.length)
    .map((grant) => ({
      collection: grant.collection as Collection,
      fields: grant.fields,
      condition: grant.condition.trim(),
      graphql_version: grant.graphql_version,
    })),
  write_rules: draft.writes.flatMap((grant) =>
    grant.mutators.map((mutator) => ({
      mutator: mutator as Mutator,
      condition: grant.condition.trim(),
      graphql_version: grant.graphql_version,
    }))
  ),
})

export type DraftProblem = "name" | "no_condition" | "cel"

// Problems keyed by what they are on: "name", or the id of a grant. Empty
// grants are left out when saving, so their conditions do not matter.
export const draftProblems = (
  draft: PolicyDraft
): Map<string | number, DraftProblem[]> => {
  const problems = new Map<string | number, DraftProblem[]>()
  const add = (key: string | number, problem: DraftProblem) =>
    problems.set(key, [...(problems.get(key) ?? []), problem])

  if (!draft.name.trim()) add("name", "name")
  const check = (id: number, condition: string) => {
    if (!condition.trim()) add(id, "no_condition")
    else if (celSyntaxError(condition)) add(id, "cel")
  }
  for (const grant of draft.reads)
    if (grant.fields.length) check(grant.id, grant.condition)
  for (const grant of draft.writes)
    if (grant.mutators.length) check(grant.id, grant.condition)
  return problems
}

// What the grid shows a group as: its read grants and its write grants.
export const grantsOf = (draft: PolicyDraft, group: GroupKey) => ({
  reads: draft.reads.filter((grant) => groupOfCollection(grant.collection) === group),
  writes: draft.writes.filter((grant) => grant.group === group),
})

// The groups to show, in grid order: those the policy grants something in, and
// those just added to grant something in. The rest are offered to be added.
export const visibleGroups = (draft: PolicyDraft, added: GroupKey[] = []): GroupKey[] =>
  [...GROUPS, "other" as const].filter((group) => {
    const { reads, writes } = grantsOf(draft, group)
    return reads.length || writes.length || added.includes(group)
  })

export const addableGroups = (
  draft: PolicyDraft,
  added: GroupKey[] = []
): GroupKey[] => {
  const visible = visibleGroups(draft, added)
  return GROUPS.filter((group) => !visible.includes(group))
}

// MO checks that every condition parses while it reads the variables, and names
// a condition that does not by the index of its rule in the state sent:
//   Variable '$state' got invalid value '…' at 'state.write_rules[0].condition';
//   Expected type 'CEL'. INVALID_ARGUMENT: ERROR: <input>:1:8: Syntax error: …
const CEL_ERROR =
  /at 'state\.(read_rules|write_rules)\[(\d+)\]\.condition'; Expected type 'CEL'\.\s*([\s\S]*)$/

// The grants whose conditions MO rejected, by grant id, with MO's explanation.
// Indices are into the rules toState sends, so empty grants are skipped and a
// write grant counts once per mutator.
export const celErrorsOf = (
  draft: PolicyDraft,
  messages: string[]
): Map<number, string> => {
  const reads = draft.reads.filter((grant) => grant.fields.length)
  const writes = draft.writes.flatMap((grant) => grant.mutators.map(() => grant))
  const errors = new Map<number, string>()
  for (const message of messages) {
    const match = CEL_ERROR.exec(message)
    if (!match) continue
    const [, kind, index, detail] = match
    const grant = (kind === "read_rules" ? reads : writes)[Number(index)]
    if (grant && !errors.has(grant.id))
      errors.set(
        grant.id,
        detail
          .replace(/^INVALID_ARGUMENT:\s*/, "")
          .replace(/\s*\[INVALID_ARGUMENT\]\s*$/, "")
      )
  }
  return errors
}

// A new policy with the rules of an existing one, which may be managed
export const copyOf = (
  draft: PolicyDraft,
  uuid: string,
  name: string
): PolicyDraft => ({
  ...draft,
  uuid,
  name,
  managed: false,
})

// MO answers a read it does not allow with this message and no error code.
// Policies are readable by admins only, so other users see it on every page.
export const isAccessDenied = (err: unknown): boolean =>
  (err as { response?: { errors?: { message: string }[] } }).response?.errors?.some(
    (e) => e.message === "No policy approved the access"
  ) ?? false

// What loading a policy into the editor can come to, besides the draft itself
export type PolicyLoad = PolicyDraft | "missing" | "no_access"
