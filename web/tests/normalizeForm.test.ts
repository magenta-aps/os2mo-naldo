import { describe, it, expect } from "vitest"
import {
  normalizeEngagement,
  normalizeAssociation,
  normalizeITUser,
  normalizeAddress,
  normalizeManager,
  normalizeOwner,
  normalizeLeave,
  normalizeKLE,
  normalizeOrganisation,
  normalizeRolebinding,
} from "$lib/utils/normalizeForm"

describe("normalizeEngagement", () => {
  it("extracts expected fields", () => {
    const result = normalizeEngagement({
      validity: { to: "2023-03-03T00:00:00" },
      org_unit_response: { uuid: "ou-1", current: { name: "Skole" } },
      job_function_response: { current: { name: "Specialist" } },
      engagement_type_response: { current: { name: "Ansat" } },
      user_key: "12345",
      primary_response: { current: { name: "Primær" } },
    })
    expect(result).toEqual({
      to: "2023-03-03",
      org_unit: "ou-1",
      job_function: "Specialist",
      engagement_type: "Ansat",
      user_key: "12345",
      primary: "Primær",
    })
  })

  it("handles null/missing fields", () => {
    const result = normalizeEngagement({
      validity: { to: null },
      org_unit_response: { uuid: undefined, current: null },
      job_function_response: { current: null },
      engagement_type_response: { current: null },
      primary_response: { current: null },
    })
    expect(result).toEqual({
      to: null,
      org_unit: null,
      job_function: null,
      engagement_type: null,
      user_key: null,
      primary: "",
    })
  })
})

describe("normalizeAssociation", () => {
  it("extracts expected fields", () => {
    const result = normalizeAssociation({
      validity: { to: "2025-12-31T00:00:00" },
      person_response: { uuid: "p-1", current: { name: "Bruce" } },
      org_unit_response: { uuid: "ou-1", current: { name: "IT" } },
      association_type_response: { current: { name: "Projektleder" } },
      primary_response: { current: { name: "Primær" } },
      substitute_response: { current: { name: "Katrine" } },
      trade_union_response: { current: { name: "FOA" } },
    })
    expect(result).toEqual({
      to: "2025-12-31",
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
    const result = normalizeITUser(
      {
        validity: { to: "2024-06-01T00:00:00" },
        itsystem_response: { current: { name: "Active Directory" } },
        user_key: "bruce",
        primary_response: { current: { name: "Primær" } },
        external_id: "ext-123",
        engagements: [
          { validities: [{ uuid: "e-2" }] },
          { validities: [{ uuid: "e-1" }] },
        ],
      },
      "some note"
    )
    expect(result).toEqual({
      to: "2024-06-01",
      itsystem: "Active Directory",
      user_key: "bruce",
      primary: "Primær",
      external_id: "ext-123",
      note: "some note",
      engagements: ["e-1", "e-2"],
    })
  })

  it("returns empty engagements when none present", () => {
    const result = normalizeITUser(
      {
        validity: { to: null },
        itsystem_response: { current: null },
        primary_response: { current: null },
      },
      null
    )
    expect(result.engagements).toEqual([])
  })
})

describe("normalizeAddress", () => {
  it("extracts expected fields", () => {
    const result = normalizeAddress({
      validity: { to: "2025-01-01T00:00:00" },
      address_type_response: { current: { name: "Email" } },
      name: "test@example.com",
      user_key: "test@example.com",
      visibility_response: { current: { name: "Offentlig" } },
    })
    expect(result).toEqual({
      to: "2025-01-01",
      address_type: "Email",
      value: "test@example.com",
      user_key: "test@example.com",
      visibility: "Offentlig",
      ituser: "",
    })
  })
})

describe("normalizeManager", () => {
  it("extracts expected fields", () => {
    const result = normalizeManager({
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
    })
    expect(result).toEqual({
      to: null,
      person: "p-1",
      org_unit: "ou-1",
      manager_type: "Direktør",
      manager_level: "Niveau 4",
      responsibility: ["Personale: ansættelse", "Personale: øvrige"],
    })
  })
})

describe("normalizeOwner", () => {
  it("extracts uuid from owner_response", () => {
    expect(
      normalizeOwner({
        validity: { to: "2025-01-01T00:00:00" },
        owner_response: { uuid: "p-1" },
      })
    ).toEqual({ to: "2025-01-01", person: "p-1" })
  })

  it("handles null owner_response", () => {
    expect(normalizeOwner({ validity: { to: null }, owner_response: null })).toEqual({
      to: null,
      person: undefined,
    })
  })
})

describe("normalizeLeave", () => {
  it("extracts expected fields", () => {
    expect(
      normalizeLeave({
        validity: { to: "2024-01-01T00:00:00" },
        leave_type_response: { current: { name: "Barsel" } },
        engagement_response: { uuid: "eng-1" },
      })
    ).toEqual({ to: "2024-01-01", leave_type: "Barsel", engagement: "eng-1" })
  })
})

describe("normalizeKLE", () => {
  it("formats kle number and aspects", () => {
    expect(
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
      normalizeOrganisation({
        validity: { to: null },
        name: "IT-afdelingen",
        parent_response: { uuid: "parent-1" },
        unit_type_response: { current: { name: "Afdeling" } },
        unit_level_response: { current: { name: "Niveau 3" } },
        time_planning_response: { current: { name: "Norm" } },
        user_key: "IT",
      })
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
      normalizeRolebinding({
        validity: { to: "2025-06-01T00:00:00" },
        role_response: { current: { name: "Admin" } },
      })
    ).toEqual({ to: "2025-06-01", role: "Admin" })
  })
})
