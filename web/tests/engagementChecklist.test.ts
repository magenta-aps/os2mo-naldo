// @vitest-environment jsdom

import { fireEvent, render, within } from "@testing-library/svelte"
import { readable } from "svelte/store"
import { describe, expect, it, vi } from "vitest"

// See selectContract.test.ts: the component reaches `$env/dynamic/public`
// through $lib/utils/helpers.
vi.mock("$env/dynamic/public", () => ({ env: {} }))
// Translation keys stand in for the translated text.
vi.mock("svelte-i18n", () => ({ _: readable((key: string) => key) }))

import EngagementChecklist from "$lib/components/forms/shared/EngagementChecklist.svelte"

const row = (uuid: string, name: string, end = "") => ({ uuid, name, end })
// Danish puts Æ, Ø, Å last, in that order; plain character order puts Å first.
const ROWS = [
  row("b", "B"),
  row("aa", "Å"),
  row("o", "Ø"),
  row("ae", "Æ"),
  row("a", "A"),
]

// The header and the rows by what they say, as a user finds them.
const header = (container: HTMLElement) =>
  within(container).getByRole<HTMLInputElement>("checkbox", {
    name: /^(Select_all|Deselect_all)$/,
  })
const rowBoxes = (container: HTMLElement) =>
  within(container)
    .getAllByRole<HTMLInputElement>("checkbox")
    .filter((box) => box !== header(container))
const names = (container: HTMLElement) =>
  rowBoxes(container).map((box) => box.closest("label")?.textContent?.trim())
const endDates = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLInputElement>("input[name^=end-date-]")].map(
    (input) => [input.name, input.value]
  )

describe("EngagementChecklist", () => {
  it("lists the engagements in Danish order without reordering the given rows", () => {
    const rows = [...ROWS]
    const { container } = render(EngagementChecklist, { props: { engagements: rows } })
    expect(names(container)).toEqual(["A", "B", "Æ", "Ø", "Å"])
    expect(rows).toEqual(ROWS)
  })

  it("selects every row, then none, from the header", async () => {
    const { container } = render(EngagementChecklist, { props: { engagements: ROWS } })
    await fireEvent.click(header(container))
    expect(rowBoxes(container).every((box) => box.checked)).toBe(true)
    expect(header(container).checked).toBe(true)

    await fireEvent.click(header(container))
    expect(rowBoxes(container).some((box) => box.checked)).toBe(false)
  })

  it("marks the header indeterminate while only some rows are selected", () => {
    const { container } = render(EngagementChecklist, {
      props: { engagements: ROWS, selected: ["b"] },
    })
    expect(header(container).checked).toBe(false)
    expect(header(container).indeterminate).toBe(true)
  })

  it("posts the end date of the selected rows only, keyed by uuid", () => {
    const { container } = render(EngagementChecklist, {
      props: {
        engagements: [row("a", "A", "2030-01-01T00:00:00+01:00"), row("b", "B")],
        selected: ["a"],
      },
    })
    expect(endDates(container)).toEqual([["end-date-a", "2030-01-01T00:00:00+01:00"]])
  })

  it("drops the selection of rows a reloaded list no longer has", async () => {
    const { container, component } = render(EngagementChecklist, {
      props: {
        engagements: [row("a", "A"), row("b", "B")],
        selected: ["a", "b"],
      },
    })
    await component.$set({ engagements: [row("b", "B"), row("c", "C")] })
    expect(rowBoxes(container).map((box) => [box.value, box.checked])).toEqual([
      ["b", true],
      ["c", false],
    ])
    expect(header(container).checked).toBe(false)
    expect(header(container).indeterminate).toBe(true)
  })
})
