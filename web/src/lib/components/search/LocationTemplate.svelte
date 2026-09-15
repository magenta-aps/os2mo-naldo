<script lang="ts">
  import { suffixUserKey } from "$lib/utils/helpers"

  export let orgUnit:
    | {
        name: string
        user_key?: string
        ancestors?: { name: string }[]
      }
    | undefined

  // Whether the path ends with the unit itself. False where the unit is
  // already named above the path, as in an org unit search result.
  export let includeUnit: boolean = true

  // MO lists ancestors bottom-up; the path reads top-down.
  $: ancestorNames = [...(orgUnit?.ancestors ?? [])].reverse().map(({ name }) => name)

  // A deep path keeps both ends and leaves out the middle.
  $: levels =
    ancestorNames.length <= 4
      ? ancestorNames
      : [...ancestorNames.slice(0, 2), "..", ...ancestorNames.slice(-2)]
</script>

{#if orgUnit && ancestorNames.length}
  <div class="text-xs">
    <span class="text-base-content/80">{levels.join(" / ")}</span>

    {#if includeUnit}
      <span class="text-base-content/80">/</span>
      <span class="text-primary">{suffixUserKey(orgUnit.name, orgUnit.user_key)}</span>
    {/if}
  </div>
{/if}
