// @vitest-environment jsdom

// Contract tests for the shared Select wrapper. These pin behaviors that
// every form depends on but that live implicitly in the component — each of
// them has caused (or nearly caused) a real regression when a consumer
// violated the contract without noticing.
//
// Not pinned here: the component also CLEARS a selection when the loaded
// options do not contain it (including an empty-but-present list — which is
// why consumers must pass `undefined`, never `[]`, while options load). That
// path runs through svelte-select internals that only engage in a real
// browser; under jsdom the value survives, so a test would pin the opposite
// of production behavior. It is covered in a real browser instead, by
// e2e/refetch-check.cjs ("moving the date back clears the stale selection").
import { render, waitFor } from "@testing-library/svelte"
import { describe, expect, it, vi } from "vitest"

// Under jsdom, SvelteKit's `$env/dynamic/public` resolves to its browser
// variant, which expects the SvelteKit runtime globals. The component only
// pulls it in transitively (via $lib/utils/helpers → $lib/env), so an empty
// env is fine.
vi.mock("$env/dynamic/public", () => ({ env: {} }))

import Select from "$lib/components/forms/shared/Select.svelte"

const OPTIONS = [
  { uuid: "a-1", name: "Alpha" },
  { uuid: "b-2", name: "Beta" },
]

const hidden = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>("input[name=subject]")

describe("Select posting contract", () => {
  it("posts the selected value's uuid through a hidden input named after the id", () => {
    const { container } = render(Select, {
      props: { id: "subject", iterable: OPTIONS, startValue: OPTIONS[0] },
    })
    expect(hidden(container)?.value).toBe("a-1")
  })

  it("posts nothing when no value is selected", () => {
    const { container } = render(Select, {
      props: { id: "subject", iterable: OPTIONS },
    })
    expect(hidden(container)).toBeNull()
  })
})

describe("Select prefill survival", () => {
  it("keeps a prefilled value while the options are still loading (iterable undefined)", async () => {
    const { container } = render(Select, {
      props: { id: "subject", iterable: undefined, startValue: OPTIONS[0] },
    })
    // Give the clearing workaround's afterUpdate + setTimeout a chance to
    // (wrongly) fire before asserting it did not.
    await new Promise((r) => setTimeout(r, 50))
    expect(hidden(container)?.value).toBe("a-1")
  })

  it("keeps the selection when the loaded options contain its uuid", async () => {
    const { container, component } = render(Select, {
      props: { id: "subject", iterable: undefined, startValue: OPTIONS[0] },
    })
    component.$set({ iterable: [...OPTIONS.map((o) => ({ ...o }))] })
    await new Promise((r) => setTimeout(r, 50))
    expect(hidden(container)?.value).toBe("a-1")
  })

  it("clears a value whose name is empty — mappers must fall back to the uuid for unresolved names", async () => {
    // Pinned as CURRENT behavior: an empty name is indistinguishable from a
    // cleared selection, so the component drops the value entirely — uuid and
    // all. Seeding code must never produce { uuid, name: "" }.
    const { container } = render(Select, {
      props: {
        id: "subject",
        iterable: OPTIONS,
        startValue: { uuid: "a-1", name: "" },
      },
    })
    await waitFor(() => expect(hidden(container)).toBeNull())
  })
})
