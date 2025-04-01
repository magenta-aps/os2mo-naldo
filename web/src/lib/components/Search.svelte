<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import SvelteSelect from "svelte-select"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import SearchItem from "./SearchItem.svelte"
  import { date } from "$lib/stores/date"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { findClosestValidity } from "$lib/util/helpers"
  import {
    SearchEmployeeDocument,
    SearchOrgUnitDocument,
    type SearchEmployeeQuery,
    type SearchOrgUnitQuery,
    LazyEmployeeSearchDocument,
    type LazyEmployeeSearchQuery,
    LazyOrgUnitSearchDocument,
    type LazyOrgUnitSearchQuery,
  } from "./query.generated"
  import { env } from "$env/dynamic/public"

  type Employees = SearchEmployeeQuery["employees"]["objects"][0]["validities"]
  type OrgUnits = SearchOrgUnitQuery["org_units"]["objects"][0]["validities"]
  type LazyEmployees = NonNullable<
    LazyEmployeeSearchQuery["employees"]
  >["objects"][0]["validities"]
  type LazyOrgUnits = NonNullable<
    LazyOrgUnitSearchQuery["org_units"]
  >["objects"][0]["validities"]

  type SearchItems = Employees | OrgUnits | LazyEmployees | LazyOrgUnits
  type SearchItem = SearchItems[0]

  // { name: string; uuid: string } allows us to use `<Search>` in forms, without using validity, since it's not needed.
  export let startValue: SearchItem | { name: string; uuid: string } | undefined =
    undefined
  export let value: SearchItem | { name: string; uuid: string } | undefined =
    startValue || undefined
  export let name: string | undefined = undefined
  export let type: "employee" | "org-unit"
  export let action: "select" | "goto" = "select" // Redirect for navigation, select for forms
  export let title: string = `${type === "employee" ? "Person" : "Organisation"}`
  export let id = `${type}-uuid`
  export let required = false
  export let extra_classes = ""
  export let disabled = false
  export let errors: string[] = []

  // Custom variable for loading/spinner, since aborting queries makes svelte-select set `loading = true`
  let spinner = false

  $: if (value?.name) {
    name = value?.name
  }

  const itemId = "uuid" // Used by the component to differentiate between items

  let items: SearchItems

  gql`
    query SearchEmployee($filter: EmployeeFilter!, $limit: int) {
      employees(filter: $filter, limit: $limit) {
        objects {
          validities {
            uuid
            name
            cpr_number
            validity {
              from
              to
            }
          }
        }
      }
    }

    query SearchOrgUnit($filter: OrganisationUnitFilter!, $limit: int) {
      org_units(filter: $filter, limit: $limit) {
        objects {
          validities {
            uuid
            name
            validity {
              from
              to
            }
          }
        }
      }
    }

    query LazyOrgUnitSearch($orgUnitFilter: OrganisationUnitFilter!) {
      org_units(filter: $orgUnitFilter) {
        objects {
          validities {
            name
            uuid
            addresses {
              address_type {
                name
              }
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
            root {
              name
            }
            parent {
              name
            }
            validity {
              from
              to
            }
          }
        }
      }
    }

    query LazyEmployeeSearch($employeeFilter: EmployeeFilter!) {
      employees(filter: $employeeFilter) {
        objects {
          validities {
            name
            uuid
            cpr_number
            addresses {
              address_type {
                name
              }
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
            validity {
              from
              to
            }
          }
        }
      }
    }
  `

  let abortController: AbortController
  const searchItems = async (filterText: string) => {
    if (!filterText.length) return []
    if (filterText.length < 3) return []

    spinner = true
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    let res:
      | SearchEmployeeQuery
      | SearchOrgUnitQuery
      | LazyEmployeeSearchQuery
      | LazyOrgUnitSearchQuery

    switch (type) {
      case "employee":
        let employeeFilter
        // Check if FF is true, else search "normally"
        if (env.PUBLIC_SEARCH_INFINITY === "true" && action === "goto") {
          employeeFilter = { from_date: null, to_date: null, query: filterText }
        } else {
          employeeFilter = { from_date: $date, query: filterText }
        }
        res = await graphQLClient(abortController.signal).request(
          SearchEmployeeDocument,
          {
            filter: employeeFilter,
            limit: 15,
          }
        )

        items = res.employees.objects
          .map((item) => findClosestValidity(item.validities, $date))
          .sort((a, b) => (a.name > b.name ? 1 : -1))

        if (env.PUBLIC_SIMPLE_SEARCH === "true") {
          return items
        }

        let lazyEmployeeFilter
        if (env.PUBLIC_SEARCH_INFINITY === "true" && action === "goto") {
          lazyEmployeeFilter = {
            from_date: null,
            to_date: null,
            uuids: items.map((e) => e.uuid),
          }
        } else {
          lazyEmployeeFilter = { from_date: $date, uuids: items.map((e) => e.uuid) }
        }

        res = await graphQLClient(abortController.signal).request(
          LazyEmployeeSearchDocument,
          {
            employeeFilter: lazyEmployeeFilter,
          }
        )

        if (res.employees) {
          return (items = res.employees.objects
            .map((item) => findClosestValidity(item.validities, $date))
            .sort((a, b) => (a.name > b.name ? 1 : -1)))
        }

      case "org-unit":
        let orgUnitFilter
        // Check if FF is true, else search "normally"
        if (env.PUBLIC_SEARCH_INFINITY === "true" && action === "goto") {
          orgUnitFilter = { from_date: null, to_date: null, query: filterText }
        } else {
          orgUnitFilter = { from_date: $date, query: filterText }
        }
        res = await graphQLClient(abortController.signal).request(
          SearchOrgUnitDocument,
          {
            filter: orgUnitFilter,
            limit: 15,
          }
        )

        items = res.org_units.objects
          .map((item) => findClosestValidity(item.validities, $date))
          .sort((a, b) => (a.name > b.name ? 1 : -1))

        if (env.PUBLIC_SIMPLE_SEARCH === "true") {
          return items
        }

        let lazyOrgFilter
        if (env.PUBLIC_SEARCH_INFINITY === "true" && action === "goto") {
          lazyOrgFilter = {
            from_date: null,
            to_date: null,
            uuids: items.map((e) => e.uuid),
          }
        } else {
          lazyOrgFilter = { from_date: $date, uuids: items.map((e) => e.uuid) }
        }

        res = await graphQLClient(abortController.signal).request(
          LazyOrgUnitSearchDocument,
          {
            orgUnitFilter: lazyOrgFilter,
          }
        )

        if (res.org_units) {
          return (items = res.org_units.objects
            .map((item) => findClosestValidity(item.validities, $date))
            .sort((a, b) => (a.name > b.name ? 1 : -1)))
        }
    }
    spinner = false
  }

  const floatingConfig = {
    placement: "bottom-start",
    strategy: "fixed",
  }
</script>

<div class="w-full {extra_classes} {action === 'select' ? 'pb-3' : ''}">
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
      loading={spinner}
      bind:value
      hideEmptyState={true}
      placeholder={type === "employee"
        ? capital($_("search_for.person"))
        : capital($_("search_for.organisation"))}
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
            updateGlobalNavigation(value.uuid)
          }
          // Removes lingering/distracting value from staying after being redirected
          value = undefined
        }
      }}
    >
      <div slot="item" let:item>
        <SearchItem {item} {type} />
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
