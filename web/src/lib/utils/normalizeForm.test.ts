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
} from "./normalizeForm"

describe("normalizeEngagement", () => {
  it("extracts expected fields", () => {
    const result = normalizeEngagement({
      validity: { to: "2023-03-03T00:00:00" },
      org_unit: [{ uuid: "ou-1", name: "Skole" }],
      job_function: { name: "Specialist" },
      engagement_type: { name: "Ansat" },
      user_key: "12345",
      primary: { name: "Primær" },
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
      org_unit: [],
      job_function: null,
      engagement_type: null,
      primary: null,
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
      person: [{ uuid: "p-1", name: "Bruce" }],
      org_unit: [{ uuid: "ou-1", name: "IT" }],
      association_type: { name: "Projektleder" },
      primary: { name: "Primær" },
      substitute: [{ name: "Katrine" }],
      trade_union: { name: "FOA" },
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
        itsystem: { name: "Active Directory" },
        user_key: "bruce",
        primary: { name: "Primær" },
        external_id: "ext-123",
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
    })
  })
})

describe("normalizeAddress", () => {
  it("extracts expected fields", () => {
    const result = normalizeAddress({
      validity: { to: "2025-01-01T00:00:00" },
      address_type: { name: "Email" },
      name: "test@example.com",
      user_key: "test@example.com",
      visibility: { name: "Offentlig" },
    })
    expect(result).toEqual({
      to: "2025-01-01",
      address_type: "Email",
      value: "test@example.com",
      user_key: "test@example.com",
      visibility: "Offentlig",
    })
  })
})

describe("normalizeManager", () => {
  it("extracts expected fields", () => {
    const result = normalizeManager({
      validity: { to: null },
      person: [{ uuid: "p-1" }],
      org_unit: [{ uuid: "ou-1" }],
      manager_type: { name: "Direktør" },
      manager_level: { name: "Niveau 4" },
      responsibilities: [
        { name: "Personale: ansættelse" },
        { name: "Personale: øvrige" },
      ],
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
  it("extracts uuid from owner", () => {
    expect(
      normalizeOwner({
        validity: { to: "2025-01-01T00:00:00" },
        owner: [{ uuid: "p-1" }],
      })
    ).toEqual({ to: "2025-01-01", person: "p-1" })
  })

  it("handles empty owner", () => {
    expect(normalizeOwner({ validity: { to: null }, owner: [] })).toEqual({
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
        leave_type: { name: "Barsel" },
        engagement: { uuid: "eng-1" },
      })
    ).toEqual({ to: "2024-01-01", leave_type: "Barsel", engagement: "eng-1" })
  })
})

describe("normalizeKLE", () => {
  it("formats kle number and aspects", () => {
    expect(
      normalizeKLE({
        validity: { to: null },
        kle_number: [{ uuid: "kle-1", user_key: "00.01", name: "Kommunens styrelse" }],
        kle_aspects: [{ name: "Indsigt" }, { name: "Udførende" }],
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
        parent: { uuid: "parent-1" },
        unit_type: { name: "Afdeling" },
        org_unit_level: { name: "Niveau 3" },
        time_planning: { name: "Norm" },
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
        role: [{ name: "Admin" }],
      })
    ).toEqual({ to: "2025-06-01", role: "Admin" })
  })
})
