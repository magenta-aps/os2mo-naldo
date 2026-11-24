// @vitest-environment jsdom

import { fireEvent, render, waitFor } from "@testing-library/svelte"
import { readable } from "svelte/store"
import { describe, expect, it, vi } from "vitest"

vi.mock("$env/dynamic/public", () => ({ env: {} }))
vi.mock("$app/paths", () => ({ base: "" }))
vi.mock("$app/navigation", () => ({ goto: vi.fn() }))
// Translation keys stand in for the translated text.
vi.mock("svelte-i18n", () => ({ _: readable((key: string) => key) }))

// MO's answer to a condition that does not parse, as a real MO sent it
const MO_CEL_ERROR =
  "Variable '$state' got invalid value '{{ nope' at 'state.write_rules[0].condition'; Expected type 'CEL'. INVALID_ARGUMENT: ERROR: <input>:1:8: Syntax error: mismatched input '<EOF>' expecting ':'\n | {{ nope\n | .......^ [INVALID_ARGUMENT]"

// jsdom does not lay out, so it has no scrolling
Element.prototype.scrollIntoView = vi.fn()

const request = vi.fn()
vi.mock("$lib/http/client", () => ({
  graphQLClient: () => ({ request }),
}))

import PolicyForm from "$lib/components/admin/policies/PolicyForm.svelte"
import { emptyDraft, newWriteGrant } from "$lib/utils/policies"
import { Collection } from "$lib/graphql/types"

const draftWithCondition = (condition: string) => {
  const draft = emptyDraft("policy-1")
  draft.name = "Probe"
  draft.writes = [
    { ...newWriteGrant(Collection.Class), mutators: ["class_create"], condition },
  ]
  return draft
}

describe("PolicyForm", () => {
  it("shows MO's refusal of a condition under that condition", async () => {
    request.mockImplementation(async (document: unknown) => {
      // The fields of a collection load by introspection, as a plain string
      if (typeof document === "string") return { __type: { fields: [] } }
      throw Object.assign(new Error("GraphQL Error"), {
        response: { errors: [{ message: MO_CEL_ERROR }] },
      })
    })
    const { container } = render(PolicyForm, {
      // Passes the check in the browser, so only MO can refuse it
      draft: draftWithCondition('{"uuids": [token.uuid]}'),
      isNew: true,
    })

    await fireEvent.submit(container.querySelector("form")!)
    await waitFor(() =>
      expect(
        container.querySelector('[data-grant="write"] pre')?.textContent
      ).toContain("Syntax error")
    )
    // And it stays, rather than being cleared by the save's own aftermath
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container.querySelector('[data-grant="write"] pre')?.textContent).toContain(
      "Syntax error"
    )
  })

  it("refuses a syntax error itself, without asking MO", async () => {
    request.mockReset()
    request.mockResolvedValue({ __type: { fields: [] } })
    const { container } = render(PolicyForm, {
      draft: draftWithCondition('{"uuids": [token.uuid]'),
      isNew: true,
    })

    await fireEvent.submit(container.querySelector("form")!)
    await waitFor(() =>
      expect(
        container.querySelector('[data-grant="write"] [data-cel-syntax]')?.textContent
      ).toContain("Expected RBRACE")
    )
    expect(
      request.mock.calls.filter(([document]) => typeof document !== "string")
    ).toEqual([])
  })
})
