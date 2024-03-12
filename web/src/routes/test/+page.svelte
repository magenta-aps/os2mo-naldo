<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { query } from "gql-query-builder"
  import NoValueSelect from "$lib/components/NoValueSelect.svelte"
  import { sortItemsBy } from "$lib/util/helpers"
  import { graphQLClient } from "$lib/util/http"
  import InsightsSelectMultiple from "$lib/components/insights/InsightsSelectMultiple.svelte"
  import InsightsTable from "$lib/components/tables/InsightsTable.svelte"

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
    fields?: Field[]
  }

  let mainQuery: MainQuery
  let fields: Field[] = []
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
    { operation: "addresses", filter: "AddressFilter", value: "address", n: 2 },
    { operation: "engagements", filter: "EngagementFilter", value: "engagement", n: 2 },
    {
      operation: "associations",
      filter: "AssociationFilter",
      value: "association",
      n: 2,
    },
    { operation: "itusers", filter: "ITUserFilter", value: "ituser", n: 2 },
    {
      operation: "rolebindings",
      filter: "RoleBindingFilter",
      value: "rolebinding",
      n: 2,
    },
    { operation: "kles", filter: "KLEFilter", value: "kle", n: 2 },
    { operation: "managers", filter: "ManagerFilter", value: "manager", n: 2 },
    { operation: "owners", filter: "OwnerFilter", value: "owner", n: 2 },
    {
      operation: "related_units",
      filter: "RelatedUnitFilter",
      value: "related_unit",
      n: 2,
    },
  ]

  const updateQuery = async () => {
    if (!mainQuery) return
    const myQuery = query(
      {
        operation: mainQuery.operation,
        variables: {
          filter: {
            value: { uuids: "f06ee470-9f17-566f-acbe-e938112d46d9" },
            type: mainQuery.filter,
          },
        },
        fields: [{ objects: [{ validities: fields.map((field) => field.subString) }] }],
      },
      null,
      { operationName: `get_${mainQuery.operation}` }
    )
    console.log(myQuery)

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
  }
</script>

<div class="flex flex-row gap-6">
  <NoValueSelect
    title={capital($_("lol"))}
    id="lol"
    iterable={sortItemsBy(items, "value")}
    bind:value={mainQuery}
    extra_classes="basis-1/3"
    isClearable={true}
  />
  <InsightsSelectMultiple
    title={capital($_("lol"))}
    id="lol"
    iterable={mainQuery ? mainQuery.fields : undefined}
    bind:value={fields}
    extra_classes="basis-1/3"
  />
  <NoValueSelect
    title={capital($_("lol"))}
    id="lol"
    iterable={sortItemsBy(items, "value")}
    bind:value={mainQuery}
    extra_classes="basis-1/3"
    isClearable={true}
  />
</div>
<button
  class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
  disabled={!mainQuery}
  on:click={async () => updateQuery()}>{capital($_("search"))}</button
>
<div class="px-12 pt-6">
  <h1 class="mb-4">Test</h1>
</div>
{#if !data}
  ingenting
{:else}
  <InsightsTable {data} tense="present" {mainQuery} />
{/if}
