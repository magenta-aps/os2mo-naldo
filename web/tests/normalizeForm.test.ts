import { jsonSerializer } from "$lib/http/dateTimes"
import { startOfDay } from "$lib/utils/date"
import {
  normalizeAddress,
  normalizeAssociation,
  normalizeEngagement,
  normalizeITUser,
  normalizeKLE,
  normalizeLeave,
  normalizeManager,
  normalizeOrganisation,
  normalizeOwner,
  normalizeRolebinding,
} from "$lib/utils/normalizeForm"
import { Temporal } from "temporal-polyfill"
import { describe, expect, it } from "vitest"

const day = (s: string) => Temporal.PlainDate.from(s)
const sent = (value: unknown) => JSON.parse(jsonSerializer.stringify(value))

// `to` stays MO's moment; `sent` compares it the way it is sent on to MO.
describe("normalizeEngagement", () => {
  it("extracts expected fields", () => {
    const result = sent(
      normalizeEngagement({
        validity: { to: startOfDay(day("2023-04-01")) },
        org_unit_response: { uuid: "ou-1", current: { name: "Skole" } },
        job_function_response: { current: { name: "Specialist" } },
        engagement_type_response: { current: { name: "Ansat" } },
        user_key: "12345",
        primary_response: { current: { name: "Primær" } },
        extension_1: "Skoleleder",
        extension_4: "42",
      })
    )
    expect(result).toEqual({
      to: "2023-04-01T00:00:00+02:00",
      org_unit: "ou-1",
      job_function: "Specialist",
      engagement_type: "Ansat",
      user_key: "12345",
      primary: "Primær",
      extension_1: "Skoleleder",
      extension_4: "42",
    })
  })

  it("handles null/missing fields", () => {
    const result = sent(
      normalizeEngagement({
        validity: { to: null },
        org_unit_response: { uuid: undefined, current: null },
        job_function_response: { current: null },
        engagement_type_response: { current: null },
        primary_response: { current: null },
      })
    )
    expect(result).toEqual({
      to: null,
      org_unit: null,
      job_function: null,
      engagement_type: null,
      user_key: null,
      primary: "",
      extension_1: "",
      extension_4: "",
    })
  })
})

describe("normalizeAssociation", () => {
  it("extracts expected fields", () => {
    const result = sent(
      normalizeAssociation({
        validity: { to: startOfDay(day("2026-01-01")) },
        person_response: { uuid: "p-1", current: { name: "Bruce" } },
        org_unit_response: { uuid: "ou-1", current: { name: "IT" } },
        association_type_response: { current: { name: "Projektleder" } },
        primary_response: { current: { name: "Primær" } },
        substitute_response: { current: { name: "Katrine" } },
        trade_union_response: { current: { name: "FOA" } },
      })
    )
    expect(result).toEqual({
      to: "2026-01-01T00:00:00+01:00",
      person: "p-1",
      org_unit: "ou-1",
      association_type: "Projektleder",
      primary: "Primær",
      substitute: "Katrine",
      trade_union: "FOA",
    })
  })
})

describe("normalizeITUser", () => {
  it("extracts expected fields", () => {
    const result = sent(
      normalizeITUser(
        {
          validity: { to: startOfDay(day("2024-06-01")) },
          itsystem_response: { current: { name: "Active Directory" } },
          user_key: "bruce",
          primary_response: { current: { name: "Primær" } },
          external_id: "ext-123",
        },
        "some note"
      )
    )
    expect(result).toEqual({
      to: "2024-06-01T00:00:00+02:00",
      itsystem: "Active Directory",
      user_key: "bruce",
      primary: "Primær",
      external_id: "ext-123",
      note: "some note",
    })
  })
})

describe("normalizeAddress", () => {
  it("extracts expected fields", () => {
    const result = sent(
      normalizeAddress({
        validity: { to: startOfDay(day("2025-01-01")) },
        address_type_response: { current: { name: "Email" } },
        name: "test@example.com",
        user_key: "test@example.com",
        visibility_response: { current: { name: "Offentlig" } },
      })
    )
    expect(result).toEqual({
      to: "2025-01-01T00:00:00+01:00",
      address_type: "Email",
      value: "test@example.com",
      user_key: "test@example.com",
      visibility: "Offentlig",
    })
  })
})

describe("normalizeManager", () => {
  it("extracts expected fields", () => {
    const result = sent(
      normalizeManager({
        validity: { to: null },
        person_response: { uuid: "p-1" },
        org_unit_response: { uuid: "ou-1" },
        manager_type_response: { current: { name: "Direktør" } },
        manager_level_response: { current: { name: "Niveau 4" } },
        responsibilities_response: {
          objects: [
            { current: { name: "Personale: ansættelse" } },
            { current: { name: "Personale: øvrige" } },
          ],
        },
        engagement_response: { uuid: "eng-1" },
        primary_response: { uuid: "prim-1" },
      })
    )
    expect(result).toEqual({
      to: null,
      person: "p-1",
      org_unit: "ou-1",
      manager_type: "Direktør",
      manager_level: "Niveau 4",
      responsibility: ["Personale: ansættelse", "Personale: øvrige"],
      engagement: "eng-1",
      primary: "prim-1",
    })
  })
})

describe("normalizeOwner", () => {
  it("extracts uuid from owner_response", () => {
    expect(
      sent(
        normalizeOwner({
          validity: { to: startOfDay(day("2025-01-01")) },
          owner_response: { uuid: "p-1" },
        })
      )
    ).toEqual({ to: "2025-01-01T00:00:00+01:00", person: "p-1" })
  })

  it("handles null owner_response", () => {
    expect(
      sent(normalizeOwner({ validity: { to: null }, owner_response: null }))
    ).toEqual({
      to: null,
      person: undefined,
    })
  })
})

describe("normalizeLeave", () => {
  it("extracts expected fields", () => {
    expect(
      sent(
        normalizeLeave({
          validity: { to: startOfDay(day("2024-01-01")) },
          leave_type_response: { current: { name: "Barsel" } },
          engagement_response: { uuid: "eng-1" },
        })
      )
    ).toEqual({
      to: "2024-01-01T00:00:00+01:00",
      leave_type: "Barsel",
      engagement: "eng-1",
    })
  })
})

describe("normalizeKLE", () => {
  it("formats kle number and aspects", () => {
    expect(
      sent(
        normalizeKLE({
          validity: { to: null },
          kle_number_response: {
            current: { user_key: "00.01", name: "Kommunens styrelse" },
          },
          kle_aspects_response: {
            objects: [
              { current: { name: "Indsigt" } },
              { current: { name: "Udførende" } },
            ],
          },
        })
      )
    ).toEqual({
      to: null,
      kle_number: "00.01 - Kommunens styrelse",
      kle_aspect: ["Indsigt", "Udførende"],
    })
  })
})

describe("normalizeOrganisation", () => {
  it("extracts expected fields", () => {
    expect(
      sent(
        normalizeOrganisation({
          validity: { to: null },
          name: "IT-afdelingen",
          parent_response: { uuid: "parent-1" },
          unit_type_response: { current: { name: "Afdeling" } },
          unit_level_response: { current: { name: "Niveau 3" } },
          time_planning_response: { current: { name: "Norm" } },
          user_key: "IT",
        })
      )
    ).toEqual({
      to: null,
      name: "IT-afdelingen",
      parent: "parent-1",
      unit_type: "Afdeling",
      org_unit_level: "Niveau 3",
      time_planning: "Norm",
      user_key: "IT",
    })
  })
})

describe("normalizeRolebinding", () => {
  it("extracts role name", () => {
    expect(
      sent(
        normalizeRolebinding({
          validity: { to: startOfDay(day("2025-06-01")) },
          role_response: { current: { name: "Admin" } },
        })
      )
    ).toEqual({ to: "2025-06-01T00:00:00+02:00", role: "Admin" })
  })
})
