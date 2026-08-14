import {
  employeeDisplayName,
  filterEngagementsByType,
  filterManagersOutOfEngagements,
  filterVisibleAddresses,
  sortAssociations,
  sortByName,
  type OrgViewerAddress,
  type OrgViewerAssociation,
  type OrgViewerEmployee,
  type OrgViewerEngagement,
} from "$lib/components/orgviewer/organisation"
import { describe, expect, it } from "vitest"

const employee = (overrides: Partial<OrgViewerEmployee>): OrgViewerEmployee => ({
  uuid: "uuid",
  name: "name",
  nickname: "",
  manager_roles: [],
  ...overrides,
})

describe("sortAssociations", () => {
  it("sorts by the ported role weight table, descending", () => {
    const associations: OrgViewerAssociation[] = [
      { association_type: { name: "TR" }, employee: [], substitute: [] },
      { association_type: { name: "Formand" }, employee: [], substitute: [] },
      { association_type: { name: "Leder" }, employee: [], substitute: [] },
    ]
    const result = sortAssociations(associations).map((a) => a.association_type.name)
    expect(result).toEqual(["Formand", "TR", "Leder"])
  })

  it("treats unrecognized association types as weight 0 (sorted last)", () => {
    const associations: OrgViewerAssociation[] = [
      { association_type: { name: "Unknown role" }, employee: [], substitute: [] },
      { association_type: { name: "AMR" }, employee: [], substitute: [] },
    ]
    const result = sortAssociations(associations).map((a) => a.association_type.name)
    expect(result).toEqual(["AMR", "Unknown role"])
  })

  it("does not mutate the input array", () => {
    const associations: OrgViewerAssociation[] = [
      { association_type: { name: "TR" }, employee: [], substitute: [] },
      { association_type: { name: "Formand" }, employee: [], substitute: [] },
    ]
    const original = [...associations]
    sortAssociations(associations)
    expect(associations).toEqual(original)
  })
})

describe("employeeDisplayName", () => {
  it("prefers nickname when showNickname is true and nickname is set", () => {
    const e = employee({ name: "Formal Name", nickname: "Nick" })
    expect(employeeDisplayName(e, true)).toBe("Nick")
  })

  it("falls back to name when showNickname is true but nickname is empty", () => {
    const e = employee({ name: "Formal Name", nickname: "" })
    expect(employeeDisplayName(e, true)).toBe("Formal Name")
  })

  it("uses name when showNickname is false", () => {
    const e = employee({ name: "Formal Name", nickname: "Nick" })
    expect(employeeDisplayName(e, false)).toBe("Formal Name")
  })

  it("returns an empty string for an undefined employee (vacant post)", () => {
    expect(employeeDisplayName(undefined, true)).toBe("")
  })
})

describe("sortByName", () => {
  it("sorts alphabetically by the first employee's name", () => {
    const people = [
      { employee: [employee({ name: "Charlie" })] },
      { employee: [employee({ name: "Alice" })] },
      { employee: [employee({ name: "Bob" })] },
    ]
    expect(sortByName(people, false).map((p) => p.employee[0].name)).toEqual([
      "Alice",
      "Bob",
      "Charlie",
    ])
  })

  it("sorts by nickname when showNickname is true", () => {
    const people = [
      { employee: [employee({ name: "Zed", nickname: "Aaa" })] },
      { employee: [employee({ name: "Yolanda", nickname: "Bbb" })] },
    ]
    expect(sortByName(people, true).map((p) => p.employee[0].nickname)).toEqual([
      "Aaa",
      "Bbb",
    ])
  })
})

describe("filterManagersOutOfEngagements", () => {
  const engagements = [
    { employee: [employee({ manager_roles: [{ uuid: "m1" }] })] },
    { employee: [employee({ manager_roles: [] })] },
  ] as OrgViewerEngagement[]

  it("passes everything through when disabled", () => {
    expect(filterManagersOutOfEngagements(engagements, false)).toHaveLength(2)
  })

  it("filters out engagements whose employee has manager_roles when enabled", () => {
    expect(filterManagersOutOfEngagements(engagements, true)).toHaveLength(1)
  })
})

describe("filterEngagementsByType", () => {
  const engagements = [
    { engagement_type_uuid: "student" },
    { engagement_type_uuid: "employee" },
  ] as OrgViewerEngagement[]

  it("passes everything through when the list is empty", () => {
    expect(filterEngagementsByType(engagements, [])).toHaveLength(2)
  })

  it("filters out engagements matching a removed type", () => {
    const result = filterEngagementsByType(engagements, ["student"])
    expect(result.map((e) => e.engagement_type_uuid)).toEqual(["employee"])
  })
})

describe("filterVisibleAddresses", () => {
  const address = (overrides: Partial<OrgViewerAddress>): OrgViewerAddress => ({
    uuid: "uuid",
    value: "value",
    address_type: { uuid: "at", name: "Type", user_key: "SomeKey", scope: "TEXT" },
    ...overrides,
  })

  it("hides addresses with visibility 'Hemmelig'", () => {
    const addresses = [address({ visibility: { name: "Hemmelig" } }), address({})]
    const result = filterVisibleAddresses(addresses, {
      hiddenUserKeys: [],
      removeOrgUnitEmail: false,
    })
    expect(result).toHaveLength(1)
  })

  it("hides addresses whose address_type.user_key is in hiddenUserKeys", () => {
    const addresses = [
      address({ address_type: { uuid: "at", name: "T", user_key: "Hidden", scope: "TEXT" } }),
      address({}),
    ]
    const result = filterVisibleAddresses(addresses, {
      hiddenUserKeys: ["Hidden"],
      removeOrgUnitEmail: false,
    })
    expect(result).toHaveLength(1)
  })

  it("hides the org unit email (user_key 'EmailUnit') when removeOrgUnitEmail is set", () => {
    const addresses = [
      address({ address_type: { uuid: "at", name: "E-mail", user_key: "EmailUnit", scope: "EMAIL" } }),
      address({}),
    ]
    const result = filterVisibleAddresses(addresses, {
      hiddenUserKeys: [],
      removeOrgUnitEmail: true,
    })
    expect(result).toHaveLength(1)
  })

  it("keeps the org unit email when removeOrgUnitEmail is false", () => {
    const addresses = [
      address({ address_type: { uuid: "at", name: "E-mail", user_key: "EmailUnit", scope: "EMAIL" } }),
    ]
    const result = filterVisibleAddresses(addresses, {
      hiddenUserKeys: [],
      removeOrgUnitEmail: false,
    })
    expect(result).toHaveLength(1)
  })
})
