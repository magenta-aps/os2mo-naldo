import {
  addressRowSummary,
  engagementRowSummary,
  ituserRowSummary,
  managerRowSummary,
} from "$lib/userflow/hubSummaries"
import { describe, expect, it } from "vitest"

describe("engagementRowSummary", () => {
  it("summarises a filled engagement", () => {
    const summary = engagementRowSummary({
      fromDate: "2026-09-01",
      toDate: "",
      orgUnit: { uuid: "u1", name: "Borgmesterens Afdeling" },
      user_key: "",
      jobFunction: { uuid: "j1", name: "Jurist" },
      engagementType: { uuid: "t1", name: "Ansat" },
      primary: undefined,
      extension1: "",
      extension4: "",
    })
    expect(summary.title).toBe("Jurist — Borgmesterens Afdeling")
    expect(summary.meta).toBe("2026-09-01 → ∞ · Ansat")
  })

  it("marks unchosen parts with a dash", () => {
    const summary = engagementRowSummary({
      fromDate: "2026-09-01",
      toDate: "2027-01-01",
      orgUnit: undefined,
      user_key: "",
      jobFunction: undefined,
      engagementType: undefined,
      primary: undefined,
      extension1: "",
      extension4: "",
    })
    expect(summary.title).toBe("— — —")
    expect(summary.meta).toBe("2026-09-01 → 2027-01-01")
  })
})

describe("ituserRowSummary", () => {
  it("counts only rolebindings with a chosen role", () => {
    const summary = ituserRowSummary({
      fromDate: "2026-09-01",
      toDate: "",
      itSystem: { uuid: "s1", name: "Active Directory" },
      user_key: "mbj",
      externalId: "",
      notes: "",
      primary: undefined,
      rolebindings: [{ role: { uuid: "r1", name: "Role" } }, { role: undefined }],
    })
    expect(summary.title).toBe("Active Directory · mbj")
    expect(summary.meta).toBe("2026-09-01 → ∞ · 1 × rolebinding")
  })
})

describe("managerRowSummary", () => {
  it("summarises type, unit and level", () => {
    const summary = managerRowSummary({
      fromDate: "2026-09-01",
      toDate: "",
      orgUnit: { uuid: "u1", name: "Skole og Børn" },
      managerType: { uuid: "t1", name: "Direktør" },
      managerLevel: { uuid: "l1", name: "Niveau 1" },
      responsibilities: [],
    })
    expect(summary.title).toBe("Direktør — Skole og Børn")
    expect(summary.meta).toBe("2026-09-01 → ∞ · Niveau 1")
  })
})

describe("addressRowSummary", () => {
  it("prefers the human-readable value name", () => {
    const summary = addressRowSummary({
      fromDate: "2026-09-01",
      toDate: "",
      visibility: { uuid: "v1", name: "Må vises" },
      addressType: { uuid: "a1", name: "Lokation", scope: "DAR" },
      addressValue: { name: "Rådhuspladsen 1", value: "dar-uuid" },
      user_key: "",
    })
    expect(summary.title).toBe("Lokation: Rådhuspladsen 1")
    expect(summary.meta).toBe("2026-09-01 → ∞ · Må vises")
  })

  it("falls back to the raw value", () => {
    const summary = addressRowSummary({
      fromDate: "2026-09-01",
      toDate: "",
      visibility: undefined,
      addressType: { uuid: "a1", name: "Email", scope: "EMAIL" },
      addressValue: { name: "", value: "mbj@kolding.dk" },
      user_key: "",
    })
    expect(summary.title).toBe("Email: mbj@kolding.dk")
  })
})
