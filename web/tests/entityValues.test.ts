import {
  engagementToValues,
  engagementValuesChanged,
} from "$lib/components/forms/entity/types"
import { describe, expect, it } from "vitest"

const engagement = {
  user_key: "eng-1",
  validity: { from: "2020-01-01T00:00:00+01:00", to: "2030-01-01T00:00:00+01:00" },
  org_unit_response: { uuid: "unit-1", current: { name: "Unit" } },
  job_function_response: { uuid: "job-1", current: { name: "Jurist" } },
  engagement_type_response: { uuid: "type-1", current: { name: "Ansat" } },
  primary_response: { uuid: "primary-1", current: { name: "Primær" } },
  extension_1: "ext1",
  extension_4: "ext4",
}

describe("engagementToValues", () => {
  it("maps the fetched engagement into the field-group shape", () => {
    const values = engagementToValues(engagement)
    expect(values.toDate).toBe("2030-01-01")
    expect(values.orgUnit).toEqual({ uuid: "unit-1", name: "Unit" })
    expect(values.jobFunction).toEqual({ uuid: "job-1", name: "Jurist" })
    expect(values.engagementType).toEqual({ uuid: "type-1", name: "Ansat" })
    expect(values.primary).toEqual({ uuid: "primary-1", name: "Primær" })
    expect(values.user_key).toBe("eng-1")
    expect(values.extension1).toBe("ext1")
    expect(values.extension4).toBe("ext4")
  })

  it("maps an open end date and a missing primary to empty values", () => {
    const values = engagementToValues({
      ...engagement,
      validity: { from: "2020-01-01T00:00:00+01:00", to: null },
      primary_response: null,
    })
    expect(values.toDate).toBe("")
    expect(values.primary).toBeUndefined()
  })

  it("falls back to the uuid when a related object's name does not resolve", () => {
    // An empty name would make the Select clear the whole selection.
    const values = engagementToValues({
      ...engagement,
      job_function_response: { uuid: "job-1", current: null },
    })
    expect(values.jobFunction).toEqual({ uuid: "job-1", name: "job-1" })
  })
})

describe("engagementValuesChanged", () => {
  const initial = engagementToValues(engagement)

  it("reports no change for two independent seeds of the same engagement", () => {
    expect(engagementValuesChanged(engagementToValues(engagement), initial)).toBe(false)
  })

  it("detects an editable field change by uuid", () => {
    const current = engagementToValues(engagement)
    current.jobFunction = { uuid: "job-2", name: "Jurist" }
    expect(engagementValuesChanged(current, initial)).toBe(true)
  })

  it("detects clearing the primary", () => {
    const current = engagementToValues(engagement)
    current.primary = undefined
    expect(engagementValuesChanged(current, initial)).toBe(true)
  })

  it("detects extension changes", () => {
    const current = engagementToValues(engagement)
    current.extension1 = "changed"
    expect(engagementValuesChanged(current, initial)).toBe(true)
  })

  it("detects clearing, first-setting, and extending the end date", () => {
    const cleared = engagementToValues(engagement)
    cleared.toDate = ""
    expect(engagementValuesChanged(cleared, initial)).toBe(true)

    const openInitial = engagementToValues({
      ...engagement,
      validity: { from: "2020-01-01T00:00:00+01:00", to: null },
    })
    const firstSet = engagementToValues({
      ...engagement,
      validity: { from: "2020-01-01T00:00:00+01:00", to: null },
    })
    firstSet.toDate = "2031-01-01"
    expect(engagementValuesChanged(firstSet, openInitial)).toBe(true)

    const extended = engagementToValues(engagement)
    extended.toDate = "2031-01-01"
    expect(engagementValuesChanged(extended, initial)).toBe(true)
  })

  it("ignores a shortened end date (that is the terminate flow's job)", () => {
    const shortened = engagementToValues(engagement)
    shortened.toDate = "2025-01-01"
    expect(engagementValuesChanged(shortened, initial)).toBe(false)
  })
})
