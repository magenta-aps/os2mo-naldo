import { getEngagementDisplay } from "$lib/utils/display"
import { describe, expect, it } from "vitest"

describe("getEngagementDisplay", () => {
  const engagement = {
    extension_1: "Skoleleder",
    job_function_response: { current: { name: "Specialist", user_key: "SPEC" } },
  }

  it("shows plain job_function name and org unit when SD-code mode is off", () => {
    expect(getEngagementDisplay(engagement, "Haderslev skole", false, true)).toBe(
      "Specialist, Haderslev skole"
    )
  })

  it("shows extension_1 when SD-code mode and extension_1 are both on", () => {
    expect(getEngagementDisplay(engagement, "Haderslev skole", true, true)).toBe(
      "Skoleleder, Haderslev skole"
    )
  })

  it("falls back to the user_key - name composite when extension_1 is off", () => {
    expect(getEngagementDisplay(engagement, "Haderslev skole", true, false)).toBe(
      "SPEC - Specialist, Haderslev skole"
    )
  })

  it("falls back to the composite when extension_1 is on but unset", () => {
    const withoutExtension = { ...engagement, extension_1: null }
    expect(getEngagementDisplay(withoutExtension, "Haderslev skole", true, true)).toBe(
      "SPEC - Specialist, Haderslev skole"
    )
  })

  it("renders only the org unit when job_function_response is missing", () => {
    const withoutJobFunction = { ...engagement, job_function_response: undefined }
    expect(
      getEngagementDisplay(withoutJobFunction, "Haderslev skole", true, false)
    ).toBe("Haderslev skole")
  })

  it("renders only the job title when the org unit does not resolve", () => {
    expect(getEngagementDisplay(engagement, undefined, false, false)).toBe("Specialist")
  })

  it("renders an empty string when neither half resolves", () => {
    expect(
      getEngagementDisplay(
        { job_function_response: undefined },
        undefined,
        false,
        false
      )
    ).toBe("")
  })
})
