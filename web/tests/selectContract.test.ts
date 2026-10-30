// @vitest-environment jsdom

// Pins the shared Select's value contracts that every form relies on but the
// component only implies (see the Form footguns in AGENTS.md).
//
// Not pinned here: clearing a selection the loaded options do not contain
// (which is why consumers pass `undefined`, never `[]`, while options load).
// That path runs through svelte-select internals that only engage in a real
// browser; under jsdom the value survives, so a test would pin the opposite of
// production. e2e/refetch.spec.ts covers it instead.
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

  // An empty name reads as a cleared selection, so seeding code falls back to
  // the uuid for a name that does not resolve.
  it("drops a value whose name is empty", async () => {
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
