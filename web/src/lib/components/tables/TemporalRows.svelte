<script lang="ts">
  // One row per object uuid, whatever its validities look like. Owns everything
  // a temporal table needs and no table should repeat: folding MO's validity
  // slices into periods, classifying the object into one tense section, the
  // date cell, the history drawer and the preview that drives it.
  //
  // A table supplies its objects, a `fields` function naming the columns it
  // shows, and its own value cells in the default slot. The cells read
  // `let:period` rather than the object directly, so previewing a period in the
  // drawer re-renders them as they stood then.
  import { onDestroy } from "svelte"
  import { _ } from "svelte-i18n"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import ChangeHistoryRow from "$lib/components/tables/ChangeHistoryRow.svelte"
  import { getColumnLock } from "$lib/components/shared/columnLock"
  import { splitOnGaps, toPeriods, type Field, type Period } from "$lib/utils/changes"
  import { spellTenseFilter } from "$lib/utils/tenses"
  import { findClosestValidityWithin, getMinMaxValidities } from "$lib/utils/validities"
  import { sortData } from "$lib/utils/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { date } from "$lib/stores/date"
  import Icon from "@iconify/svelte"
  import keyboardArrowUpRounded from "@iconify/icons-material-symbols/keyboard-arrow-up-rounded"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"

  type Validities = { uuid: string; validities: any[] }

  // As MO returns them: one entry per uuid, each holding its validities
  export let objects: Validities[]
  export let tense: Tense
  // The columns this table shows, in column order, for one validity
  export let fields: (object: any) => Field[]
  // Per period, so an edit opens on the dates of the period it was asked from
  export let editHref: (uuid: string, period: Period<any>) => string
  export let auditHref: (uuid: string) => string
  // Narrows a uuid's validities before anything else — the org unit pages show
  // only the stretch an object pointed at the unit being viewed
  export let include: (validity: any) => boolean = () => true

  let expanded: Record<string, boolean> = {}
  let previewed: Record<string, Period<any> | undefined> = {}

  // Previewing swaps values of differing widths, and an auto table layout
  // re-measures every column each time, so the table jumps under the pointer.
  // Hold the columns still for as long as a history row is open.
  const columnLock = getColumnLock()

  const toggleExpanded = (uuid: string) => {
    // Taken before `expanded` changes, so the widths pinned are the ones on
    // screen rather than the ones the open drawer produces
    if (expanded[uuid]) columnLock?.release()
    else columnLock?.hold()
    expanded[uuid] = !expanded[uuid]
    // A closing drawer can't release its own preview
    previewed[uuid] = undefined
  }

  // Switching tense tabs unmounts this with rows still open
  onDestroy(() => {
    for (const open of Object.values(expanded)) if (open) columnLock?.release()
  })

  $: rows = objects.flatMap((object) => {
    const slices = object.validities.filter(include)
    if (!slices.length) return []

    // The spells it actually ran for. One row covers all of them, but the tense
    // sections read the spells rather than their outer span, so a gap cannot
    // make the row claim to be present through it.
    const spells = splitOnGaps(slices)
    if (!spellTenseFilter(spells.map(getMinMaxValidities), tense, $date)) return []

    // Periods per spell, so the one starting a spell reads as a start rather
    // than as a diff against values from before the gap.
    const periods = spells.flatMap((spell) => toPeriods(spell, fields))
    const span = getMinMaxValidities(slices)

    return [
      {
        uuid: object.uuid,
        periods,
        shown:
          findClosestValidityWithin(periods, span, $date) ??
          periods[periods.length - 1],
        // Named `validity` so a table's existing `validity.from` sort path keeps
        // addressing the row
        validity: span,
      },
    ]
  })

  // Sorting reads the values on screen, so it sorts by what the row displays
  $: sorted = sortData(
    rows.map((row) => ({ ...row, ...(row.shown.object as object) })),
    $sortKey,
    $sortDirection
  )
</script>

{#each sorted as row, i (row.uuid)}
  {@const preview = previewed[row.uuid]}
  {@const period = preview ?? row.shown}
  <tr
    class="{preview ? 'bg-accent' : i % 2 === 0 ? '' : 'bg-base-200'}
    leading-5 border-t border-base-300 text-base-content"
  >
    <slot {period} {preview} uuid={row.uuid} />

    <!-- While previewing, the period's own dates rather than the object's
         lifetime, so the row reads as one coherent snapshot of that period -->
    <ValidityTableCell validity={preview ? period.validity : row.validity}>
      {#if row.periods.length > 1}
        <button
          type="button"
          class="mt-2 inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs text-primary
            {expanded[row.uuid] ? 'border-primary bg-accent' : 'border-base-300'}"
          aria-expanded={expanded[row.uuid] ? true : false}
          on:click={() => toggleExpanded(row.uuid)}
        >
          <Icon
            icon={expanded[row.uuid]
              ? keyboardArrowUpRounded
              : keyboardArrowDownRounded}
            width="16"
            height="16"
          />
          {$_("change_count", { values: { n: row.periods.length - 1 } })}
        </button>
      {/if}
    </ValidityTableCell>

    <slot name="actions" uuid={row.uuid} {period} />
  </tr>

  {#if expanded[row.uuid] && row.periods.length > 1}
    <!-- `shown` follows the preview, so the marked period is always the one the
         row above is actually rendering -->
    <ChangeHistoryRow
      periods={row.periods}
      shown={period}
      on:preview={(e) => (previewed[row.uuid] = e.detail)}
      editHref={(p) => editHref(row.uuid, p)}
      auditHref={auditHref(row.uuid)}
    />
  {/if}
{:else}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4"><slot name="empty" /></td>
  </tr>
{/each}
