/**
 * Tests for CSV export (Insights page).
 *
 * The Insights page lets users select org units and sub-queries (engagements,
 * managers, etc.) and export the data as CSV. The json2csv function handles:
 * - Column ordering (org_units always first)
 * - One row per sub-query item, with org unit columns repeated
 * - Empty units still appear (with blank sub-query columns)
 * - Items that moved to another unit are filtered out
 * - IT users are nested inside engagements and need special extraction
 * - CSV escaping for semicolons, quotes, and newlines
 *
 * svelte-i18n is mocked: the translation function echoes back the key,
 * so headers appear as their translation keys (e.g. "name", "user_key").
 */
import { describe, it, expect, vi } from "vitest"

vi.mock("svelte-i18n", () => ({
  _: {
    subscribe: (fn: any) => {
      fn((key: string) => key)
      return () => {}
    },
  },
}))
vi.mock("svelte/store", () => ({
  get: () => (key: string) => key,
}))

import { json2csv } from "$lib/utils/csv"
import type { SelectedQuery, Field } from "$lib/utils/insights"

/** Creates a Field config that reads a single property from each row */
const simpleField = (label: string, accessor: string): Field => ({
  label,
  query: "",
  getHeaders: (t) => [t(label)],
  getValues: (row) => [row?.[accessor] ?? ""],
})

describe("json2csv", () => {
  it("generates header + data rows for org_units-only export", () => {
    const data = [
      { uuid: "ou-1", name: "IT-afdelingen", user_key: "IT" },
      { uuid: "ou-2", name: "HR", user_key: "HR" },
    ]
    const queries: SelectedQuery[] = [
      {
        mainQuery: {
          operation: "org_units",
          filter: "OrganisationUnitFilter",
          label: "unit",
          fields: [],
        },
        chosenFields: [
          simpleField("name", "name"),
          simpleField("user_key", "user_key"),
        ],
      },
    ]

    const csv = json2csv(data, queries)
    const lines = csv.split("\n")

    expect(lines[0]).toBe("name;user_key")
    expect(lines[1]).toBe("IT-afdelingen;IT")
    expect(lines[2]).toBe("HR;HR")
    expect(lines).toHaveLength(3)
  })

  it("creates one row per sub-query item, repeating org_unit columns", () => {
    const data = [
      {
        uuid: "ou-1",
        name: "IT",
        engagements: [
          { org_unit_uuid: "ou-1", job_title: "Developer", person: "Alice" },
          { org_unit_uuid: "ou-1", job_title: "Manager", person: "Bob" },
        ],
      },
      {
        uuid: "ou-2",
        name: "HR",
        engagements: [], // empty unit
      },
    ]
    const queries: SelectedQuery[] = [
      {
        mainQuery: {
          operation: "org_units",
          filter: "OrganisationUnitFilter",
          label: "unit",
          fields: [],
        },
        chosenFields: [simpleField("unit", "name")],
      },
      {
        mainQuery: {
          operation: "engagements",
          filter: "EngagementFilter",
          label: "engagement",
          fields: [],
        },
        chosenFields: [
          simpleField("person", "person"),
          simpleField("job", "job_title"),
        ],
      },
    ]

    const csv = json2csv(data, queries)
    const lines = csv.split("\n")

    expect(lines[0]).toBe("unit;person;job")
    expect(lines[1]).toBe("IT;Alice;Developer")
    expect(lines[2]).toBe("IT;Bob;Manager")
    // Empty unit still gets a row with blank sub-query columns
    expect(lines[3]).toBe("HR;;")
    expect(lines).toHaveLength(4)
  })

  it("forces org_units columns first even when selected after sub-queries", () => {
    const data = [
      {
        uuid: "ou-1",
        name: "IT",
        engagements: [{ org_unit_uuid: "ou-1", role: "Dev" }],
      },
    ]
    // Engagement query intentionally listed BEFORE org_units
    const queries: SelectedQuery[] = [
      {
        mainQuery: {
          operation: "engagements",
          filter: "EngagementFilter",
          label: "engagement",
          fields: [],
        },
        chosenFields: [simpleField("role", "role")],
      },
      {
        mainQuery: {
          operation: "org_units",
          filter: "OrganisationUnitFilter",
          label: "unit",
          fields: [],
        },
        chosenFields: [simpleField("unit", "name")],
      },
    ]

    const csv = json2csv(data, queries)
    const lines = csv.split("\n")

    expect(lines[0]).toBe("unit;role")
    expect(lines[1]).toBe("IT;Dev")
  })

  it("escapes semicolons and double-quotes per CSV standard", () => {
    const data = [
      { uuid: "ou-1", name: 'Value with "quotes"', description: "Has;semicolon" },
    ]
    const queries: SelectedQuery[] = [
      {
        mainQuery: {
          operation: "org_units",
          filter: "OrganisationUnitFilter",
          label: "unit",
          fields: [],
        },
        chosenFields: [simpleField("name", "name"), simpleField("desc", "description")],
      },
    ]

    const csv = json2csv(data, queries)
    const lines = csv.split("\n")

    // Quotes doubled, fields wrapped in quotes when they contain special chars
    expect(lines[1]).toBe('"Value with ""quotes""";"Has;semicolon"')
  })

  it("excludes items whose org_unit_uuid doesn't match the current unit (moved engagements)", () => {
    const data = [
      {
        uuid: "ou-1",
        name: "IT",
        engagements: [
          { org_unit_uuid: "ou-1", person: "Alice" },
          { org_unit_uuid: "ou-other", person: "Bob" }, // moved to another unit
        ],
      },
    ]
    const queries: SelectedQuery[] = [
      {
        mainQuery: {
          operation: "org_units",
          filter: "OrganisationUnitFilter",
          label: "unit",
          fields: [],
        },
        chosenFields: [simpleField("unit", "name")],
      },
      {
        mainQuery: {
          operation: "engagements",
          filter: "EngagementFilter",
          label: "engagement",
          fields: [],
        },
        chosenFields: [simpleField("person", "person")],
      },
    ]

    const csv = json2csv(data, queries)
    const lines = csv.split("\n")

    expect(lines).toHaveLength(2) // header + Alice only
    expect(lines[1]).toBe("IT;Alice")
  })

  it("extracts itusers from their nested engagement structure (aliased as 'it')", () => {
    // IT users are queried via engagements and nested as:
    // orgUnit.it[].itusers[].current
    const data = [
      {
        uuid: "ou-1",
        name: "IT",
        it: [
          {
            itusers: [
              { current: { user_key: "bruce", org_unit_uuid: "ou-1" } },
              { current: { user_key: "katrine", org_unit_uuid: "ou-1" } },
            ],
          },
        ],
      },
    ]
    const queries: SelectedQuery[] = [
      {
        mainQuery: {
          operation: "org_units",
          filter: "OrganisationUnitFilter",
          label: "unit",
          fields: [],
        },
        chosenFields: [simpleField("unit", "name")],
      },
      {
        mainQuery: {
          operation: "itusers",
          filter: "ITUserFilter",
          label: "ituser",
          fields: [],
        },
        chosenFields: [simpleField("user_key", "user_key")],
      },
    ]

    const csv = json2csv(data, queries)
    const lines = csv.split("\n")

    expect(lines[0]).toBe("unit;user_key")
    expect(lines[1]).toBe("IT;bruce")
    expect(lines[2]).toBe("IT;katrine")
  })
})
