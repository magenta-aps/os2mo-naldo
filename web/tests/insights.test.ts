import { startOfDay } from "$lib/utils/date"
import { Temporal } from "temporal-polyfill"
import { readable } from "svelte/store"
import { describe, expect, it, vi } from "vitest"

// Translation keys stand in for the translated text.
vi.mock("svelte-i18n", () => ({ _: readable((key: string) => key) }))

const { mainQueries } = await import("../src/routes/(app)/insights/mainQueries")

const field = (operation: string, label: string) => {
  const found = mainQueries
    .find((query) => query.operation === operation)
    ?.fields.find((field) => field.label === label)
  if (!found) throw new Error(`no field ${operation}.${label}`)
  return found
}
const values = (operation: string, label: string, row: object) =>
  field(operation, label).getValues(row)

const named = (name: string) => ({ uuid: "x", current: { name } })
const day = (s: string) => startOfDay(Temporal.PlainDate.from(s))

describe("fields that read a related object's name", () => {
  it.each([
    ["org_units", "parent", "parent_response"],
    ["org_units", "unit_type", "unit_type_response"],
    ["org_units", "org_unit_level", "unit_level_response"],
    ["engagements", "name", "person_response"],
    ["engagements", "engagement_type", "engagement_type_response"],
    ["engagements", "primary", "primary_response"],
    ["associations", "name", "person_response"],
    ["associations", "association_type", "association_type_response"],
    ["associations", "substitute", "substitute_response"],
    ["associations", "trade_union", "trade_union_response"],
    ["itusers", "itsystem", "itsystem_response"],
    ["itusers", "primary", "primary_response"],
    ["managers", "manager_type", "manager_type_response"],
    ["managers", "manager_level", "manager_level_response"],
    ["owners", "name", "owner_response"],
  ])("%s.%s reads %s, empty when it does not resolve", (operation, label, key) => {
    expect(values(operation, label, { [key]: named("Navn") })).toEqual(["Navn"])
    expect(values(operation, label, { [key]: { uuid: "x", current: null } })).toEqual([
      "",
    ])
    expect(values(operation, label, {})).toEqual([""])
  })
})

describe("validity", () => {
  it("writes the last valid day, not MO's exclusive `to`", () => {
    const row = { validity: { from: day("2020-01-01"), to: day("2024-11-01") } }
    expect(values("engagements", "validity", row)).toEqual([
      "2020-01-01T00:00:00+01:00",
      "2024-10-31T00:00:00+01:00",
    ])
  })

  it("leaves an open end empty", () => {
    const row = { validity: { from: day("2020-01-01"), to: null } }
    expect(values("engagements", "validity", row)).toEqual([
      "2020-01-01T00:00:00+01:00",
      "",
    ])
  })
})

describe("org_units.breadcrumbs", () => {
  it("lists the ancestors from the root down", () => {
    const row = { ancestors: [{ name: "Skole" }, { name: "Kommune" }] }
    expect(values("org_units", "breadcrumbs", row)).toEqual(["Kommune", "Skole"])
  })

  it("has a column per level of the deepest unit", () => {
    const data = [{ ancestors: [{ name: "A" }] }, { ancestors: [{}, {}, {}] }]
    expect(field("org_units", "breadcrumbs").getHeaders((key) => key, data)).toEqual([
      "Unit 1",
      "Unit 2",
      "Unit 3",
    ])
  })
})

describe("engagements", () => {
  it.each(["email", "phone"])("joins the person's %s addresses", (label) => {
    const row = {
      person_response: { current: { [label]: [{ name: "a" }, { name: "b" }] } },
    }
    expect(values("engagements", label, row)).toEqual(["a, b"])
    expect(
      values("engagements", label, { person_response: { current: null } })
    ).toEqual([""])
  })

  it("names the managers, a vacant role as such", () => {
    const row = {
      managers: [{ person_response: named("Anna") }, { person_response: null }],
    }
    expect(values("engagements", "manager", row)).toEqual(["Anna, Vacant"])
  })

  it("joins the managers' email addresses", () => {
    const row = {
      managers: [
        { person_response: { current: { addresses: [{ name: "a@x.dk" }] } } },
        { person_response: null },
        { person_response: { current: { addresses: [{ name: "b@x.dk" }] } } },
      ],
    }
    expect(values("engagements", "manager_email", row)).toEqual(["a@x.dk, b@x.dk"])
    expect(values("engagements", "manager_email", {})).toEqual([""])
  })
})

describe("itusers.rolebinding", () => {
  it("joins the role names, skipping unresolved roles", () => {
    const row = {
      rolebindings: [
        { role_response: named("Admin") },
        { role_response: { current: null } },
        { role_response: named("Reader") },
      ],
    }
    expect(values("itusers", "rolebinding", row)).toEqual(["Admin, Reader"])
    expect(values("itusers", "rolebinding", {})).toEqual([""])
  })
})

describe("managers", () => {
  it("names a vacant manager role as such", () => {
    expect(values("managers", "name", { person_response: null })).toEqual(["Vacant"])
  })

  it("joins the responsibilities, skipping unresolved ones", () => {
    const row = {
      responsibilities_response: {
        objects: [named("Budget"), { current: null }, named("Personale")],
      },
    }
    expect(values("managers", "manager_responsibility", row)).toEqual([
      "Budget, Personale",
    ])
  })
})

describe("related_units.related_unit", () => {
  it("puts the two related units in a column each", () => {
    const row = { org_units_response: { objects: [named("A"), named("B")] } }
    expect(values("related_units", "related_unit", row)).toEqual(["A", "B"])
    expect(values("related_units", "related_unit", {})).toEqual(["", ""])
  })
})
