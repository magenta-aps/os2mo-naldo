<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import SvelteSelect from "svelte-select"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import SearchItem from "./search_item.svelte"
  import { date } from "$lib/stores/date"
  import { globalNavigation } from "$lib/stores/navigation"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import {
    SearchEmployeeDocument,
    SearchOrgUnitDocument,
    type SearchEmployeeQuery,
    type SearchOrgUnitQuery,
    LazySearchDocument,
    type LazySearchQuery,
  } from "./query.generated"

  type Employees = SearchEmployeeQuery["employees"]["objects"][0]["objects"]
  type OrgUnits = SearchOrgUnitQuery["org_units"]["objects"][0]["objects"]
  type LazyEmployees = NonNullable<
    LazySearchQuery["employees"]
  >["objects"][0]["objects"]
  type LazyOrgUnits = NonNullable<LazySearchQuery["org_units"]>["objects"][0]["objects"]

  type SearchItems = Employees | OrgUnits | LazyEmployees | LazyOrgUnits
  type SearchItem = SearchItems[0]

  export let startValue: SearchItem | undefined = undefined
  export let value: SearchItem | undefined = startValue || undefined
  export let name: string | undefined = undefined
  export let uuid: string | undefined = undefined
  export let type: "employee" | "org-unit"
  export let action: "select" | "goto" = "select" // Redirect for navigation, select for forms
  export let title: string = `${type === "employee" ? "Person" : "Organisation"}`
  export let id = `${type}-uuid`
  export let required = false
  export let disabled = false
  export let errors: string[] = []

  $: if (value?.name) {
    name = value?.name
  }
  $: if (value?.uuid) {
    uuid = value?.uuid
  }

  const itemId = "uuid" // Used by the component to differentiate between items
  let loading = false

  let items: SearchItems

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

    query LazySearch($uuids: [UUID!], $isEmployeeRoute: Boolean!) {
      ...employee_or_org
    }

    fragment employee_or_org on Query {
      employees(filter: { uuids: $uuids }) @include(if: $isEmployeeRoute) {
        objects {
          objects {
            name
            uuid
            addresses {
              resolve {
                ... on DefaultAddress {
                  __typename
                  value
                }
                ... on DARAddress {
                  __typename
                  name
                }
                ... on MultifieldAddress {
                  __typename
                  value
                  value2
                }
              }
            }
            itusers {
              user_key
            }
          }
        }
      }
      org_units(filter: { uuids: $uuids }) @skip(if: $isEmployeeRoute) {
        objects {
          objects {
            name
            uuid
            addresses {
              resolve {
                ... on DefaultAddress {
                  __typename
                  value
                }
                ... on DARAddress {
                  __typename
                  name
                }
                ... on MultifieldAddress {
                  __typename
                  value
                  value2
                }
              }
            }
            parent {
              name
            }
          }
        }
      }
    }
  `

  const searchItems = async (filterText: string) => {
    if (!filterText.length) return []
    if (filterText.length < 3) return []

    loading = true
    let res: SearchEmployeeQuery | SearchOrgUnitQuery | LazySearchQuery

    switch (type) {
      case "employee":
        res = await graphQLClient().request(SearchEmployeeDocument, {
          fromDate: $date,
          queryString: filterText,
        })
        items = res.employees.objects
          .map((item) => item.objects[0])
          .sort((a, b) => (a.name > b.name ? 1 : -1))

        break

      case "org-unit":
        res = await graphQLClient().request(SearchOrgUnitDocument, {
          fromDate: $date,
          queryString: filterText,
        })
        items = res.org_units.objects
          .map((item) => item.objects[0])
          .sort((a, b) => (a.name > b.name ? 1 : -1))

        break
    }

    res = await graphQLClient().request(LazySearchDocument, {
      uuids: items.map((e) => e.uuid),
      isEmployeeRoute: type === "employee",
    })

    if (res.employees) {
      items = res.employees.objects
        .map((item) => item.objects[0])
        .sort((a, b) => (a.name > b.name ? 1 : -1))
    } else if (res.org_units) {
      items = res.org_units.objects
        .map((item) => item.objects[0])
        .sort((a, b) => (a.name > b.name ? 1 : -1))
    }

    loading = false
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
      --icons-color="#00244E"
      --padding="0 0.75rem 0 0.75rem"
      id="autocomplete"
      loadOptions={searchItems}
      {floatingConfig}
      {disabled}
      {itemId}
      hasError={errors.length ? true : false}
      {loading}
      bind:value
      hideEmptyState={true}
      placeholder={type === "employee"
        ? capital($_("search.person"))
        : capital($_("search.organisation"))}
      clearFilterTextOnBlur={false}
      on:change
      on:clear
      bind:items
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
        {selection.name}
      </div>
    </SvelteSelect>
  </div>
  {#each errors as error}
    {#if error === "required"}
      <span class="label-text-alt text-error block"
        >{$_("validation.is_required", { values: { field: title } })}</span
      >
    {/if}
  {/each}
</div>

{#if action === "select" && value}
  <input hidden {id} name={id} bind:value={value.uuid} />
{/if}
