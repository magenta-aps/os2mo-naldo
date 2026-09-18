<script lang="ts">
  import { _ } from "svelte-i18n"
  import { createEventDispatcher } from "svelte"
  import { capital } from "$lib/utils/helpers"
  import { formatDate } from "$lib/utils/date"
  import type { Period } from "$lib/utils/changes"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"

  // Oldest first, as `toPeriods` returns them
  export let periods: Period<any>[]
  // The period the collapsed row above is displaying, by identity
  export let shown: Period<any> | undefined
  export let editHref: (period: Period<any>) => string
  export let auditHref: string

  // Fires with the period to show in the row above, or undefined to release it
  const dispatch = createEventDispatcher<{ preview: Period<any> | undefined }>()

  // Released on the list, not on each period: releasing per period would flash
  // the row above back to today's values every time the pointer crosses the gap
  // between two of them.
  const release = () => dispatch("preview", undefined)

  // `focusout` fires even when focus only moves to the next period, so release
  // only once it has left the list altogether.
  const releaseOnLeaving = (event: FocusEvent) => {
    const next = event.relatedTarget
    const list = event.currentTarget as HTMLElement
    if (!(next instanceof Node) || !list.contains(next)) release()
  }

  const unset = "—"

  // Newest first: the most recent change is what a user is usually here for.
  // A period that does not start where the one before it ended is a spell of
  // its own; `gapAfter` carries the stretch in between, to be drawn under it.
  $: rows = [...periods].reverse().map((period, i, ordered) => {
    const older = ordered[i + 1]
    const apart = older && older.validity.to !== period.validity.from
    return {
      period,
      gapAfter: apart
        ? { from: older.validity.to, to: period.validity.from }
        : undefined,
    }
  })

  // The run's first period reports no diff, so summarise what it started with.
  // Insertion order is the order the caller listed the fields, which is the
  // order of the columns.
  const startValues = (period: Period<any>) =>
    period.fields
      .map((field) => field.value)
      .filter(Boolean)
      .join(" · ")
</script>

<tr>
  <!-- Clamped to the columns that exist, as the tense section headers do -->
  <td colspan={15} class="p-0 bg-base-200 border-t border-base-300">
    <div class="border-l-4 border-primary px-6 py-5 flex flex-col gap-3">
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <ul
        class="flex flex-col gap-1.5"
        on:mouseleave={release}
        on:focusout={releaseOnLeaving}
      >
        {#each rows as { period, gapAfter }}
          <li
            class="flex items-stretch rounded-sm bg-base-100 border
              {period === shown ? 'border-primary border-l-4' : 'border-base-300'}"
          >
            <!-- Hover and focus both preview, so the row above is reachable
                 without a pointer. No click handler, as with InfoTooltip. -->
            <button
              type="button"
              class="flex grow items-start gap-4 px-3.5 py-2.5 text-left"
              aria-label={capital(
                $_("show_values_as_of", {
                  values: { date: formatDate(period.validity.from) },
                })
              )}
              on:mouseenter={() => dispatch("preview", period)}
              on:focus={() => dispatch("preview", period)}
            >
              <span class="w-24 shrink-0 text-xs font-bold"
                >{formatDate(period.validity.from)}</span
              >
              <span class="grow flex flex-col gap-1">
                {#if period.changes === null}
                  <span class="flex gap-4">
                    <span class="w-40 shrink-0 text-xs text-base-content/70"
                      >{capital($_("period_start"))}</span
                    >
                    <span class="text-xs">{startValues(period)}</span>
                  </span>
                {:else}
                  {#each period.changes as change}
                    <span class="flex gap-4">
                      <span class="w-40 shrink-0 text-xs text-base-content/70"
                        >{change.label}</span
                      >
                      <span class="text-xs"
                        >{change.from || unset} → {change.to || unset}</span
                      >
                    </span>
                  {/each}
                {/if}
              </span>
              {#if period === shown}
                <span
                  class="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs text-primary"
                  >{capital($_("shown_above"))}</span
                >
              {/if}
            </button>
            <a
              class="shrink-0 flex items-start px-3.5 py-2.5"
              href={editHref(period)}
              aria-label={capital(
                $_("edit_period", {
                  values: { date: formatDate(period.validity.from) },
                })
              )}
            >
              <Icon icon={editSquareOutlineRounded} width="18" height="18" />
            </a>
          </li>
          {#if gapAfter}
            <li
              class="flex items-start gap-4 rounded-sm border border-dashed border-base-300 px-3.5 py-2"
            >
              <span class="w-24 shrink-0 text-xs font-bold text-base-content/70"
                >{formatDate(gapAfter.from)}</span
              >
              <span class="w-40 shrink-0 text-xs text-base-content/70"
                >{capital($_("inactive"))}</span
              >
              <span class="grow text-xs text-base-content/70"
                >{formatDate(gapAfter.from)} – {formatDate(gapAfter.to)}</span
              >
            </li>
          {/if}
        {/each}
      </ul>
      <a class="text-xs" href={auditHref}>{capital($_("full_history"))}</a>
    </div>
  </td>
</tr>
