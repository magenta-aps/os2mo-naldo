<script lang="ts" generics="T extends { uuid: string; name: string; end: string }">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"

  // `end` is the engagement's current end, posted so the action keeps it.
  export let engagements: T[]
  export let selected: string[] = []

  $: sorted = [...engagements].sort((a, b) => a.name.localeCompare(b.name, "da"))

  // A list reloaded for another unit or date drops the checked rows it no
  // longer has, so the select-all state compares like with like.
  const keepListed = (rows: T[]) => {
    const listed = new Set(rows.map((row) => row.uuid))
    selected = selected.filter((uuid) => listed.has(uuid))
  }
  $: keepListed(engagements)

  $: allSelected = selected.length === engagements.length
  const toggleAll = () => {
    selected = allSelected ? [] : engagements.map((row) => row.uuid)
  }
</script>

<fieldset>
  <legend class="text-sm pb-1">
    {capital($_("engagement", { values: { n: 2 } }))}
  </legend>
  <ul id="engagement-list" class="max-h-48 overflow-y-auto bg-base-100 rounded-sm p-1">
    <div class="flex text-base-content">
      <label
        class="label flex items-center gap-4 py-2 px-4 rounded-lg w-full text-sm text-base-content cursor-pointer wrap-break-word hover:bg-base-200 transition-all"
      >
        <input
          type="checkbox"
          on:click={toggleAll}
          class="checkbox checkbox-primary rounded-sm normal-case font-normal text-base text-base-100"
          checked={allSelected}
          indeterminate={selected.length > 0 && !allSelected}
        />
        <span class="label-text text-base-content">
          {capital($_(allSelected ? "deselect_all" : "select_all"))}
        </span>
      </label>
    </div>
    {#each sorted as engagement (engagement.uuid)}
      <div class="flex text-base-content">
        <label
          class="label flex items-center gap-4 py-2 px-4 rounded-lg w-full text-sm text-base-content cursor-pointer wrap-break-word hover:bg-base-200 transition-all"
        >
          <input
            type="checkbox"
            name="engagements"
            bind:group={selected}
            value={engagement.uuid}
            class="checkbox checkbox-primary rounded-sm normal-case font-normal text-base text-base-100"
          />
          <span class="label-text text-base-content">{engagement.name}</span>
          <slot {engagement} />
        </label>
        {#if selected.includes(engagement.uuid)}
          <input hidden name="end-date-{engagement.uuid}" value={engagement.end} />
        {/if}
      </div>
    {/each}
  </ul>
</fieldset>
