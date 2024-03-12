<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { query } from "gql-query-builder"
  import NoValueSelect from "$lib/components/NoValueSelect.svelte"
  import { sortItemsBy } from "$lib/util/helpers"
  import { graphQLClient } from "$lib/util/http"

  let items = [
    { operation: "org_units", filter: "OrganisationUnitFilter", value: "unit", n: 1 },
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

  let myQuery
  let state = { employee: { validity: true } }
  let mainQuery: {
    operation: string
    filter: string
    value: string
    n: number
  }

  $: vali = state.employee.validity
    ? `validity {
          from
        }`
    : ``

  const updateQuery = () => {
    myQuery = query(
      {
        operation: mainQuery.operation,
        variables: {
          filter: {
            value: { uuids: "f06ee470-9f17-566f-acbe-e938112d46d9" },
            type: mainQuery.filter,
          },
        },
        fields: [{ objects: [{ validities: ["uuid", "name", vali] }] }],
      },
      null,
      { operationName: `get_${mainQuery.operation}` }
    )
    console.log(myQuery)
  }

  const getData = async () => {
    const res = await graphQLClient().request(myQuery)
    console.log(res)
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
  <NoValueSelect
    title={capital($_("lol"))}
    id="lol"
    iterable={sortItemsBy(items, "value")}
    bind:value={mainQuery}
    extra_classes="basis-1/3"
    isClearable={true}
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
<input type="checkbox" on:change={updateQuery} bind:checked={state.employee.validity} />
<button
  class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
  on:click={async () => await getData()}>Søg</button
>
<div class="px-12 pt-6">
  <h1 class="mb-4">Test</h1>
</div>
