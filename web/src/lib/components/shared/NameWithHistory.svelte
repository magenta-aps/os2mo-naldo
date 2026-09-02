<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { date } from "$lib/stores/date"
  import { formatDate } from "$lib/utils/date"
  import {
    findClosestValidityWithin,
    filterValiditiesInRange,
  } from "$lib/utils/validities"
  import InfoTooltip from "$lib/components/shared/InfoTooltip.svelte"

  interface Validity {
    from?: any
    to?: any
  }

  interface NamedValidity {
    name?: string | null
    validity: Validity
  }

  // The referenced object's name validities (fetched with `validities(start: null, end: null)`)
  export let validities: NamedValidity[] | undefined | null
  // The validity of the row referencing the object
  export let rowValidity: Validity
  // Shown when no name can be resolved (usually the referenced object's UUID)
  export let fallback: string | undefined = undefined
  export let href: string | undefined = undefined
  // Unique per row, to key the tooltip's aria-describedby target
  export let id: string

  // Clamped to the row's validity, so past rows show the name the object
  // carried back then rather than today's.
  $: nameValidity = findClosestValidityWithin(validities, rowValidity, $date)
  $: displayName = nameValidity?.name ?? fallback

  // Newest first; only surfaced when the name changed during the row.
  $: history = validities
    ? filterValiditiesInRange(validities, rowValidity).sort((a, b) =>
        (b.validity.from ?? "").localeCompare(a.validity.from ?? "")
      )
    : []

  $: nameHistory =
    history.length > 1
      ? [
          `${capital($_("name_history"))}:`,
          ...history.map(
            (item) =>
              `${item.name ?? fallback ?? ""} (${formatDate(item.validity.from)} – ${
                item.validity.to ? formatDate(item.validity.to) : ""
              })`
          ),
        ].join("\n")
      : undefined
</script>

<div class="flex items-center gap-1">
  {#if href}
    <a {href} on:click>{displayName}</a>
  {:else}
    <span>{displayName}</span>
  {/if}
  <InfoTooltip
    info={nameHistory}
    label={capital($_("name_history"))}
    id="{id}-name-history"
  />
</div>
