<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { query } from "gql-query-builder"
  import InsightsSelect from "$lib/components/insights/InsightsSelect.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import { debounce } from "$lib/util/helpers"
  import { graphQLClient } from "$lib/util/http"
  import { date } from "$lib/stores/date"
  import InsightsSelectMultiple from "$lib/components/insights/InsightsSelectMultiple.svelte"
  import InsightsTable from "$lib/components/tables/InsightsTable.svelte"
  import Search from "$lib/components/Search.svelte"
  import type { Field, MainQuery } from "$lib/util/helpers"
  import { downloadHandler } from "$lib/util/csv"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"

  let mainQuery: MainQuery | undefined
  let chosenFields: Field[] = []
  let orgUnit: { name: string; uuid: string }
  // Can this be anything else than any??
  let data: any
  let filename: string

  // Predefined mainqueries with their possible fields etc.
  // TODO: Should probably be moved to seperate file
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
        { value: "itsystem", subString: "itsystem {name}" },
        { value: "account_name", subString: "user_key" },
        { value: "primary", subString: "primary {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    {
      operation: "rolebindings",
      filter: "RoleBindingFilter",
      value: "rolebinding",
      n: 2,
      fields: [
        { value: "ituser", subString: "ituser {user_key}" },
        // { value: "it_system", subString: "itsystem {name}" },
        { value: "role", subString: "role {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    // { operation: "kles", filter: "KLEFilter", value: "kle", n: 2 },
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
        { value: "name", subString: "owner {name}" },
        { value: "validity", subString: "validity {from to}" },
      ],
    },
    // Somehow make the 1 field actually return 2 related_unit fields, so we can see the pairing.
    {
      operation: "related_units",
      filter: "RelatedUnitFilter",
      value: "related_unit",
      n: 2,
      fields: [
        { value: "related_unit", subString: "org_units {name}" },
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
      // TODO: Need to do 2 queries somehow, otherwise we don't get the actual itusers of the unit.
      filterValue = { engagement: { org_unit: { uuids: orgUnit.uuid } } }
    } else {
      filterValue = { org_unit: { uuids: orgUnit.uuid } }
    }
    const gqlQuery = query([
      {
        operation: mainQuery.operation,
        variables: {
          filter: {
            value: filterValue,
            type: mainQuery.filter,
          },
        },
        fields: [
          {
            objects: [
              {
                operation: "current",
                variables: { date: { name: "at", value: $date, type: "DateTime" } },
                fields: chosenFields.map((field) => field.subString),
              },
            ],
          },
        ],
      },
    ])
    await getData(gqlQuery)
  }

  const getData = async (generatedQuery: {
    query: string
    variables: { filter: object }
  }) => {
    // KOMMENTAR OM AT VI SÆTTER TIL UDNEFINED
    if (!mainQuery) return
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

  const clearFilter = () => {
    mainQuery = undefined
    data = null
    chosenFields = []
    orgUnit = { name: "", uuid: "" }
  }
</script>

<HeadTitle type="insight" />

<div class="px-12 pt-6">
  <h1 class="mb-4">Insights</h1>
</div>
<div class="px-12 pt-6">
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded p-6 mb-4">
    <!-- Sort items -->
    <div class="flex flex-row gap-6">
      <InsightsSelect
        title={capital($_("main_query"))}
        id="main-query"
        iterable={items}
        bind:value={mainQuery}
        extra_classes="basis-1/2"
        isClearable={true}
      />
      <Search type="org-unit" bind:value={orgUnit} extra_classes="basis-1/2" />
    </div>
    <InsightsSelectMultiple
      title={capital($_("fields"))}
      id="fields"
      iterable={mainQuery ? mainQuery.fields : undefined}
      bind:value={chosenFields}
      extra_classes="basis-1/3"
    />
    <!-- Added debounce to avoid spamming queries -->
    <button
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      disabled={!mainQuery}
      on:click={async () => debounce(updateQuery)}>{capital($_("search"))}</button
    >
    <div class="divider p-0 m-0 my-2 w-full" />
    <Input title={capital($_("filename"))} id="filename" bind:value={filename} />
    <button
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      disabled={!data}
      on:click={(event) => downloadHandler(event, data, chosenFields, filename)}
      >{capital($_("download_as_csv"))}</button
    >
    <button
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      on:click={() => clearFilter()}>{capital($_("clear"))}</button
    >
  </div>

  {#key data}
    <InsightsTable {data} headers={chosenFields} />
  {/key}
</div>
