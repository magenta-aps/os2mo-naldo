<script lang="ts">
  import SvelteSelect from "svelte-select"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import SearchItem from "./search_item.svelte"
  import { fetchInternal } from "$lib/util/http"
  import { date } from "$lib/stores/date"
  import { globalNavigation } from "$lib/stores/navigation"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { SearchEmployeeDocument, SearchOrgUnitDocument } from "./query.generated"

  export let startValue: SearchResult | undefined = undefined
  export let value: SearchResult | undefined = startValue || undefined
  export let name: string | undefined = undefined
  export let type: "employee" | "org-unit"
  export let action: "select" | "goto" = "select" // Redirect for navigation, select for forms
  export let title: string = `Søg efter ${
    type === "employee" ? "person" : "organisation"
  }`
  export let id = `${type}-uuid`
  export let required = false
  export let disabled = false
  export let errors: string[] = []

  $: if (value?.name) {
    name = value?.name
  }

  const itemId = "uuid" // Used by the component to differentiate between items

  gql`
    query SearchEmployee($fromDate: DateTime, $queryString: String!) {
      employees(filter: { from_date: $fromDate, query: $queryString }) {
        objects {
          objects {
            uuid
            name
          }
        }
      }
    }
    query SearchOrgUnit($fromDate: DateTime, $queryString: String!) {
      org_units(filter: { from_date: $fromDate, query: $queryString }) {
        objects {
          objects {
            uuid
            name
          }
        }
      }
    }
  `

  const searchQuery =
    type === "employee" ? SearchEmployeeDocument : SearchOrgUnitDocument
  const searchItems = async (filterText: string): Promise<SearchResult[]> => {
    if (!filterText.length) return []
    if (filterText.length < 3) return []

    const res = await graphQLClient().request(searchQuery, {
      fromDate: $date,
      queryString: filterText,
    })
    if (searchQuery === SearchEmployeeDocument) {
      return res.employees.objects
        .map((item) => item.objects[0])
        .sort((a, b) => (a.name > b.name ? 1 : -1))
    } else {
      return res.org_units.objects
        .map((item) => item.objects[0])
        .sort((a, b) => (a.name > b.name ? 1 : -1))
    }
  }
  const fetchSearchResult = async (filterText: string): Promise<SearchResult[]> => {
    if (!filterText.length) return []
    if (filterText.length < 3) return []

    const res = await fetchInternal(url + filterText + "&at=" + $date)
    const json = await res.json()
    json.items.sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
    return json.items
  }

  const floatingConfig = {
    placement: "bottom-start",
    strategy: "fixed",
  }
</script>

<div class="w-full {action === 'select' ? 'pb-3' : ''}">
  <div class={action === "select" ? "pb-1" : ""}>
    {#if action === "select"}
      <label for="autocomplete" class="text-sm text-secondary pb-1">
        {title ? title : ""}
        {required ? "*" : ""}
      </label>
    {/if}
    <SvelteSelect
      --font-size="1rem"
      --height="2rem"
      --loading-height="1.5rem"
      --loading-width="1.5rem"
      --spinner-height="1.5rem"
      --spinner-width="1.5rem"
      --item-padding="0.25rem 0.75rem 0.25rem 0.75rem"
      --item-height="auto"
      --item-line-height="auto"
      --clear-select-height="1.5rem"
      --clear-select-width="1.5rem"
      --value-container-padding="0rem"
      --border-radius="0.25rem"
      --placeholder-color="#00244E"
      --icons-color="#00244E"
      --padding="0 0.75rem 0 0.75rem"
      id="autocomplete"
      loadOptions={searchItems}
      {floatingConfig}
      {disabled}
      {itemId}
      hasError={errors.length ? true : false}
      bind:value
      hideEmptyState={true}
      placeholder={`Søg efter ${type === "employee" ? "person" : "organisation"}`}
      on:change
      on:clear
      on:select={() => {
        if (action === "goto" && value) {
          goto(
            `${base}/${type === "employee" ? "employee" : "organisation"}/${value.uuid}`
          )
          if (type === "org-unit") {
            $globalNavigation.uuid = value.uuid
          }
          // Removes lingering/distracting value from staying after being redirected
          value = undefined
        }
      }}
    >
      <div slot="item" let:item>
        <SearchItem {item} />
      </div>

      <div slot="selection" let:selection>
        <SearchItem item={selection} />
      </div>
    </SvelteSelect>
  </div>
  {#each errors as error}
    {#if error === "required"}
      <span class="label-text-alt text-error block">{title} skal udfyldes</span>
    {/if}
  {/each}
</div>

{#if action === "select" && value}
  <input hidden {id} name={id} bind:value={value.uuid} />
{/if}
