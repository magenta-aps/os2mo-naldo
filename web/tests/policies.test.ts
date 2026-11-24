import {
  Collection,
  GraphQlVersion,
  Mutator,
  PolicySelectorKind,
} from "$lib/graphql/types"
import {
  celErrorsOf,
  copyOf,
  draftProblems,
  emptyDraft,
  fromPolicy,
  GROUPS,
  groupOfMutator,
  grantsOf,
  mutatorsOf,
  newReadGrant,
  newWriteGrant,
  toState,
  visibleGroups,
  addableGroups,
  isAccessDenied,
} from "$lib/utils/policies"
import { describe, expect, it } from "vitest"

const V29 = GraphQlVersion.Version_29

const policy = {
  uuid: "policy-1",
  name: "Address auditor",
  description: "Reads addresses",
  active: true,
  managed: false,
  selectors: [
    { kind: PolicySelectorKind.Role, value: "auditor" },
    { kind: PolicySelectorKind.Role, value: "admin" },
  ],
  read_rules: [
    {
      collection: "Address",
      fields: ["user_key"],
      condition: "true",
      graphql_version: V29,
    },
    {
      collection: "Address",
      fields: ["value"],
      condition: '{"uuids": [token.uuid]}',
      graphql_version: V29,
    },
  ],
  write_rules: [
    { mutator: "address_create", condition: "true", graphql_version: V29 },
    { mutator: "address_update", condition: "true", graphql_version: V29 },
    { mutator: "address_terminate", condition: "false", graphql_version: V29 },
    { mutator: "employee_update", condition: "true", graphql_version: V29 },
  ],
}

describe("mutator groups", () => {
  it("puts every mutator in a group the grid shows", () => {
    for (const mutator of Object.values(Mutator))
      expect(GROUPS).toContain(groupOfMutator(mutator))
  })

  it("lists a collection's mutators under it", () => {
    expect(mutatorsOf(Collection.Address)).toEqual([
      "address_create",
      "address_delete",
      "address_refresh",
      "address_terminate",
      "address_update",
      "addresses_create",
    ])
  })

  it("puts a mutator the frontend does not know in the other group", () => {
    expect(groupOfMutator("spaceship_launch")).toBe("other")
  })
})

describe("fromPolicy", () => {
  it("splits the selectors into roles and the kinds it does not show", () => {
    const draft = fromPolicy({
      ...policy,
      selectors: [
        { kind: PolicySelectorKind.Role, value: "auditor" },
        { kind: "group" as PolicySelectorKind, value: "staff" },
      ],
    })
    expect(draft.roles).toEqual(["auditor"])
    expect(draft.otherSelectors).toEqual([{ kind: "group", value: "staff" }])
  })

  it("keeps one read grant per read rule", () => {
    const draft = fromPolicy(policy)
    expect(draft.reads.map((g) => [g.fields, g.condition])).toEqual([
      [["user_key"], "true"],
      [["value"], '{"uuids": [token.uuid]}'],
    ])
  })

  it("joins the write rules of a group with one condition into a grant", () => {
    const draft = fromPolicy(policy)
    expect(draft.writes.map((g) => [g.group, g.mutators, g.condition])).toEqual([
      ["Address", ["address_create", "address_update"], "true"],
      ["Address", ["address_terminate"], "false"],
      ["Employee", ["employee_update"], "true"],
    ])
  })

  it("keeps write rules apart when their versions differ", () => {
    const draft = fromPolicy({
      ...policy,
      write_rules: [
        { mutator: "address_create", condition: "true", graphql_version: V29 },
        {
          mutator: "address_update",
          condition: "true",
          graphql_version: GraphQlVersion.Version_25,
        },
      ],
    })
    expect(draft.writes).toHaveLength(2)
  })
})

describe("toState", () => {
  it("gives back the policy it was read from", () => {
    const state = toState(fromPolicy(policy))
    expect(state).toEqual({
      name: policy.name,
      description: policy.description,
      active: policy.active,
      selectors: policy.selectors,
      read_rules: policy.read_rules,
      write_rules: policy.write_rules,
    })
  })

  it("writes the selectors of other kinds back", () => {
    const other = { kind: "group" as PolicySelectorKind, value: "staff" }
    const state = toState(
      fromPolicy({ ...policy, selectors: [...policy.selectors, other] })
    )
    expect(state.selectors).toContainEqual(other)
  })

  it("expands a write grant into a rule per mutator", () => {
    const draft = emptyDraft("new")
    draft.name = "Writers"
    draft.writes = [
      {
        ...newWriteGrant(Collection.Class),
        mutators: ["class_create", "class_update"],
      },
    ]
    expect(toState(draft).write_rules).toEqual([
      { mutator: "class_create", condition: "true", graphql_version: V29 },
      { mutator: "class_update", condition: "true", graphql_version: V29 },
    ])
  })

  it("leaves out grants without fields or mutators", () => {
    const draft = fromPolicy(policy)
    draft.reads.push(newReadGrant(Collection.Class))
    draft.writes.push(newWriteGrant(Collection.Class))
    expect(toState(draft)).toEqual(toState(fromPolicy(policy)))
  })

  it("trims the name and the conditions", () => {
    const draft = emptyDraft("new")
    draft.name = "  Readers "
    draft.reads = [
      { ...newReadGrant(Collection.Class), fields: ["name"], condition: " true\n" },
    ]
    const state = toState(draft)
    expect(state.name).toBe("Readers")
    expect(state.read_rules?.[0].condition).toBe("true")
  })
})

describe("draftProblems", () => {
  it("finds none in a valid draft", () => {
    expect(draftProblems(fromPolicy(policy)).size).toBe(0)
  })

  it("flags a missing name", () => {
    const draft = fromPolicy({ ...policy, name: "  " })
    expect(draftProblems(draft).get("name")).toEqual(["name"])
  })

  it("flags an empty condition on the grant", () => {
    const draft = fromPolicy(policy)
    const read = { ...newReadGrant(Collection.Class), fields: ["name"], condition: "" }
    const write = {
      ...newWriteGrant(Collection.Class),
      mutators: ["class_create"],
      condition: " ",
    }
    draft.reads.push(read)
    draft.writes.push(write)
    const problems = draftProblems(draft)
    expect(problems.get(read.id)).toEqual(["no_condition"])
    expect(problems.get(write.id)).toEqual(["no_condition"])
  })

  it("flags a condition with a typo, on grants that are saved", () => {
    const draft = fromPolicy(policy)
    const read = {
      ...newReadGrant(Collection.Class),
      fields: ["name"],
      condition: '{"uuids": [token.uuid]',
    }
    const empty = {
      ...newReadGrant(Collection.Class),
      condition: '{"uuids": [token.uuid]',
    }
    draft.reads.push(read, empty)
    const problems = draftProblems(draft)
    expect(problems.get(read.id)).toEqual(["cel"])
    expect(problems.has(empty.id)).toBe(false)
  })

  it("does not flag empty grants, whose conditions do not matter", () => {
    const draft = fromPolicy(policy)
    draft.reads.push({ ...newReadGrant(Collection.Class), condition: "" })
    draft.writes.push({ ...newWriteGrant(Collection.Class), condition: "" })
    expect(draftProblems(draft).size).toBe(0)
  })
})

describe("grantsOf and visibleGroups", () => {
  it("finds the grants of a group", () => {
    const { reads, writes } = grantsOf(fromPolicy(policy), Collection.Address)
    expect(reads).toHaveLength(2)
    expect(writes).toHaveLength(2)
  })

  it("shows the other group only when a rule needs it", () => {
    expect(visibleGroups(fromPolicy(policy))).not.toContain("other")
    const draft = fromPolicy({
      ...policy,
      read_rules: [
        {
          collection: "AccessLog",
          fields: ["id"],
          condition: "true",
          graphql_version: V29,
        },
      ],
    })
    expect(visibleGroups(draft)).toContain("other")
    expect(grantsOf(draft, "other").reads).toHaveLength(1)
  })

  it("shows the groups the policy grants in, and those just added", () => {
    const draft = fromPolicy(policy)
    expect(visibleGroups(draft)).toEqual([Collection.Address, Collection.Employee])
    expect(visibleGroups(draft, [Collection.Class])).toEqual([
      Collection.Address,
      Collection.Class,
      Collection.Employee,
    ])
  })

  it("offers every other group to be added", () => {
    const addable = addableGroups(fromPolicy(policy), [Collection.Class])
    expect(addable).not.toContain(Collection.Address)
    expect(addable).not.toContain(Collection.Class)
    expect(addable).toContain(Collection.Facet)
    expect(addable).toContain("events")
    expect(addable).not.toContain("other")
  })
})

describe("celErrorsOf", () => {
  // As MO answers a condition that does not parse
  const mo = (rule: string, condition: string) =>
    `Variable '$state' got invalid value '${condition}' at 'state.${rule}.condition'; Expected type 'CEL'. INVALID_ARGUMENT: ERROR: <input>:1:8: Syntax error: mismatched input '<EOF>' expecting ':'\n | ${condition}\n | .......^ [INVALID_ARGUMENT]`

  it("finds the write grant of a rule, counting each mutator", () => {
    const draft = fromPolicy(policy)
    // write_rules: address_create, address_update (grant 1), address_terminate (grant 2)
    const errors = celErrorsOf(draft, [mo("write_rules[2]", "{{ nope")])
    expect([...errors.keys()]).toEqual([draft.writes[1].id])
    expect(errors.get(draft.writes[1].id)).toBe(
      "ERROR: <input>:1:8: Syntax error: mismatched input '<EOF>' expecting ':'\n | {{ nope\n | .......^"
    )
  })

  it("skips empty read grants, which are not sent", () => {
    const draft = fromPolicy(policy)
    draft.reads.unshift(newReadGrant(Collection.Class))
    const errors = celErrorsOf(draft, [mo("read_rules[1]", "{{")])
    expect([...errors.keys()]).toEqual([draft.reads[2].id])
  })

  it("ignores other errors", () => {
    expect(
      celErrorsOf(fromPolicy(policy), ["No policy approved the access"]).size
    ).toBe(0)
  })
})

describe("copyOf", () => {
  it("copies the rules into a new, unmanaged policy", () => {
    const managed = fromPolicy({ ...policy, managed: true })
    const copy = copyOf(managed, "policy-2", "Copy of it")
    expect(copy).toMatchObject({ uuid: "policy-2", name: "Copy of it", managed: false })
    expect(toState(copy)).toEqual({ ...toState(managed), name: "Copy of it" })
  })
})

describe("isAccessDenied", () => {
  const moAnswer = (message: string) =>
    Object.assign(new Error("GraphQL Error"), { response: { errors: [{ message }] } })

  it("recognises MO refusing a read", () => {
    expect(isAccessDenied(moAnswer("No policy approved the access"))).toBe(true)
  })

  it("leaves every other failure alone", () => {
    expect(isAccessDenied(moAnswer("Something else broke"))).toBe(false)
    expect(isAccessDenied(new Error("Failed to fetch"))).toBe(false)
  })
})
