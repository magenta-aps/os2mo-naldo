<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { query } from "gql-query-builder"
  import NoValueSelect from "$lib/components/NoValueSelect.svelte"
  import { sortItemsBy } from "$lib/util/helpers"
  import { graphQLClient } from "$lib/util/http"
  import InsightsSelectMultiple from "$lib/components/insights/InsightsSelectMultiple.svelte"
  import InsightsTable from "$lib/components/tables/InsightsTable.svelte"
  import Search from "$lib/components/Search.svelte"

  // Types
  interface Field {
    value: string
    subString: string
  }

  interface MainQuery {
    operation: string
    filter: string
    value: string
    n: number
    fields: Field[]
  }

  let mainQuery: MainQuery
  let chosenFields: Field[] = []
  let orgUnit: { name: string; uuid: string }
  // Can this be anything else than any??
  let data: any

  // Predefined mainqueries with their possible fields etc.
  let items = [
    {
      operation: "org_units",
      filter: "OrganisationUnitFilter",
      value: "unit",
      n: 1,
      fields: [
        { value: "name", subString: "name" },
        { value: "parent", subString: "parent {name}" },
        { value: "org_unit_level", subString: "org_unit_level {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    {
      operation: "addresses",
      filter: "AddressFilter",
      value: "address",
      n: 2,
      fields: [
        { value: "address_type", subString: "address_type {name}" },
        { value: "address", subString: "name" },
        { value: "visibility", subString: "visibility {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    {
      operation: "engagements",
      filter: "EngagementFilter",
      value: "engagement",
      n: 2,
      fields: [
        { value: "name", subString: "person {name}" },
        { value: "job_function", subString: "job_function {name}" },
        { value: "engagement_type", subString: "engagement_type {name}" },
        { value: "primary", subString: "primary {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    {
      operation: "associations",
      filter: "AssociationFilter",
      value: "association",
      n: 2,
      fields: [
        { value: "name", subString: "person {name}" },
        { value: "association_type", subString: "association_type {name}" },
        { value: "substitute", subString: "substitute {name}" },
        { value: "trade_union", subString: "trade_union {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    {
      operation: "itusers",
      filter: "ITUserFilter",
      value: "ituser",
      n: 2,
      fields: [
        { value: "it_system", subString: "itsystem {name}" },
        { value: "account_name", subString: "user_key" },
        { value: "primary", subString: "primary {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    // HERTIL
    {
      operation: "rolebindings",
      filter: "RoleBindingFilter",
      value: "rolebinding",
      n: 2,
      fields: [
        { value: "ituser", subString: "ituser {name}" },
        { value: "it_system", subString: "itsystem {name}" },
        { value: "role", subString: "role {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    { operation: "kles", filter: "KLEFilter", value: "kle", n: 2 },
    {
      operation: "managers",
      filter: "ManagerFilter",
      value: "manager",
      n: 2,
      fields: [
        { value: "name", subString: "person {name}" },
        { value: "manager_responsibility", subString: "responsibilities {name}" },
        { value: "manager_type", subString: "manager_type {name}" },
        { value: "manager_level", subString: "manager_level {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    {
      operation: "owners",
      filter: "OwnerFilter",
      value: "owner",
      n: 2,
      fields: [
        { value: "name", subString: "person {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    {
      operation: "related_units",
      filter: "RelatedUnitFilter",
      value: "related_unit",
      n: 2,
      fields: [
        { value: "related_unit", subString: "person {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
  ]

  const updateQuery = async () => {
    if (!mainQuery) return
    let filterValue
    if (mainQuery.operation === "org_units") {
      filterValue = { uuids: orgUnit.uuid }
    } else if (mainQuery.operation === "itusers") {
      // Need to do 2 queries somehow, otherwise we don't get the actual itusers of the unit.
      filterValue = { engagement: { org_unit: { uuids: orgUnit.uuid } } }
    } else {
      filterValue = { org_unit: { uuids: orgUnit.uuid } }
    }
    const myQuery = query(
      {
        operation: mainQuery.operation,
        variables: {
          filter: {
            value: filterValue,
            type: mainQuery.filter,
          },
        },
        fields: [
          // Somehow do `current(at: $date)`
          { objects: [{ current: chosenFields.map((field) => field.subString) }] },
        ],
      },
      null,
      { operationName: `get_${mainQuery.operation}` }
    )
    await getData(myQuery)
  }

  const getData = async (generatedQuery: {
    query: string
    variables: { filter: object }
  }) => {
    const res = await graphQLClient().request(
      generatedQuery.query,
      generatedQuery.variables
    )

    data = res

    const results = []
    for (const outer of data[mainQuery.operation].objects) {
      results.push(outer.current)
    }
    data = results
  }
</script>

<div class="px-12 pt-6">
  <h1 class="mb-4">Insights</h1>
</div>

<div class="flex flex-row gap-6">
  <!-- Sort items -->
  <NoValueSelect
    title={capital($_("lol"))}
    id="lol"
    iterable={items}
    bind:value={mainQuery}
    extra_classes="basis-1/3"
    isClearable={true}
  />
  <!-- Sort items -->
  <InsightsSelectMultiple
    title={capital($_("lol"))}
    id="lol"
    iterable={mainQuery ? mainQuery.fields : undefined}
    bind:value={chosenFields}
    extra_classes="basis-1/3"
  />
  <Search type="org-unit" bind:value={orgUnit} required={true} />
</div>
<button
  class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
  disabled={!mainQuery}
  on:click={async () => updateQuery()}>{capital($_("search"))}</button
>

{#key data}
  <InsightsTable {data} headers={chosenFields} />
{/key}
