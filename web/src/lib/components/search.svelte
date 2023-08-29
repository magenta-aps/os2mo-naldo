<script lang="ts">
  import SvelteSelect from "svelte-select"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import SearchItem from "./search_item.svelte"
  import { fetchRest } from "$lib/util/http"
  import { date } from "$lib/stores/date"
  import { globalNavigation } from "$lib/stores/navigation"

  export let value: Autocomplete | undefined = undefined
  export let type: "employee" | "organisation" = "employee"
  export let action: "select" | "goto" = "select" // Redirect for navigation, select for forms
  export let wantedAttrs: string[] = [] // Names of attributes you want shown next the to the name ("Email", ect.)
  export let title: string = ""

  const itemId = "uuid" // Used by the component to differentiate between items
  const url = type === "employee" ? "e/autocomplete/?query=" : "ou/autocomplete/?query="

  const fetchAutocomplete = async (filterText: string): Promise<Autocomplete | []> => {
    if (!filterText.length) return []
    if (filterText.length < 4) return []

    const res = await fetchRest(url + filterText + "&at=" + $date)
    const json = await res.json()
    return json.items
  }
</script>

<div class="w-full {title ? 'pb-4' : ''}">
  {#if title}
    <label for="autocomplete" class="text-sm text-secondary pb-1">
      {title}
    </label>
  {/if}
  <SvelteSelect
    --font-size="1rem"
    --height="2rem"
    --loading-height="1.75rem"
    --loading-width="1.75rem"
    --spinner-height="1.75rem"
    --spinner-width="1.75rem"
    --item-height="2rem"
    --item-padding="0 0 0 0.75rem"
    --chevron-height="2rem"
    --clear-select-height="1.75rem"
    --clear-select-width="1.75rem"
    --value-container-padding="0rem"
    --border-radius="0.25rem"
    --placeholder-color="#00244E"
    --icons-color="#00244E"
    --border-focused="solid 2px #1053AB"
    --padding="0 0 0 0.75rem"
    id="autocomplete"
    listAutoWidth={false}
    loadOptions={fetchAutocomplete}
    {itemId}
    bind:value
    placeholder={`Søg efter ${type === "employee" ? "person" : "organisation"}`}
    on:select={() => {
      if (action === "goto" && value) {
        goto(`${base}/${type}/${value.uuid}`)
        if (type === "organisation") {
          $globalNavigation.uuid = value.uuid
        }
        // Removes lingering/distracting value from staying after being redirected
        value = undefined
      }
    }}
  >
    <div slot="item" let:item>
      <SearchItem {item} {wantedAttrs} />
    </div>

    <div slot="selection" let:selection>
      <SearchItem item={selection} {wantedAttrs} />
    </div>
  </SvelteSelect>
</div>
