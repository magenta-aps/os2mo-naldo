<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import SvelteSelect from "svelte-select"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import SearchItem from "$lib/components/search/SearchItem.svelte"
  import { date } from "$lib/stores/date"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/http/client"
  import { findClosestValidity } from "$lib/utils/validities"
  import {
    EmployeeSearchDocument,
    OrgUnitSearchDocument,
    type EmployeeSearchQuery,
    type OrgUnitSearchQuery,
  } from "./query.generated"
  import { env } from "$lib/env"

  type Employees = EmployeeSearchQuery["employees"]["objects"][0]["validities"]
  type OrgUnits = OrgUnitSearchQuery["org_units"]["objects"][0]["validities"]

  type SearchItems = Employees | OrgUnits
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
    query OrgUnitSearch(
      $orgUnitFilter: OrganisationUnitFilter!
      $defaultSearch: Boolean = true
      $limit: int
    ) {
      org_units(filter: $orgUnitFilter, limit: $limit) {
        objects {
          validities {
            name
            uuid
            ancestors {
              name
            }
            validity {
              from
              to
            }
            addresses @include(if: $defaultSearch) {
              ...AddressDetails
            }
          }
        }
      }
    }

    query EmployeeSearch(
      $employeeFilter: EmployeeFilter!
      $defaultSearch: Boolean = true
      $limit: int
    ) {
      employees(filter: $employeeFilter, limit: $limit) {
        objects {
          validities {
            name
            uuid
            cpr_number
            validity {
              from
              to
            }
            itusers @include(if: $defaultSearch) {
              user_key
            }
            addresses @include(if: $defaultSearch) {
              ...AddressDetails
            }
            ...RsdSearch @skip(if: $defaultSearch)
          }
        }
      }
    }

    fragment AddressDetails on Address {
      address_type {
        name
      }
      resolve {
        ... on DefaultAddress {
          __typename
          value
        }
        ... on MultifieldAddress {
          __typename
          value
          value2
        }
      }
    }

    fragment RsdSearch on Employee {
      engagements {
        org_unit {
          name
          ancestors {
            name
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

    let res: EmployeeSearchQuery | OrgUnitSearchQuery

    switch (type) {
      case "employee":
        let employeeFilter
        if (env.PUBLIC_SEARCH_INFINITY && action === "goto") {
          employeeFilter = {
            from_date: null,
            to_date: null,
            query: filterText,
          }
        } else {
          employeeFilter = { from_date: $date, query: filterText }
        }

        res = await graphQLClient(abortController.signal).request(
          EmployeeSearchDocument,
          {
            employeeFilter: employeeFilter,
            defaultSearch: !env.PUBLIC_ENABLE_RSD_SEARCH,
            limit: 15,
          }
        )

        if (res.employees) {
          return (items = res.employees.objects
            .map((item) => findClosestValidity(item.validities, $date))
            .sort((a, b) => (a.name > b.name ? 1 : -1)))
        }

      case "org-unit":
        let orgUnitFilter
        if (env.PUBLIC_SEARCH_INFINITY && action === "goto") {
          orgUnitFilter = {
            from_date: null,
            to_date: null,
            query: filterText,
          }
        } else {
          orgUnitFilter = { from_date: $date, query: filterText }
        }

        res = await graphQLClient(abortController.signal).request(
          OrgUnitSearchDocument,
          {
            orgUnitFilter: orgUnitFilter,
            limit: 15,
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
      <label for="autocomplete" class="text-sm text-base-content pb-1">
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
      <span class="text-xs text-error"
        >{$_("validation.is_required", { values: { field: title } })}</span
      >
    {/if}
  {/each}
</div>

{#if action === "select" && value}
  <input hidden {id} name={id} bind:value={value.uuid} />
{/if}
