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
  import { mainQueries } from "./mainQueries"

  let mainQuery: MainQuery | undefined
  let chosenFields: Field[] = []
  let orgUnit: { name: string; uuid: string } | undefined
  let data: any
  let filename: string

  const updateQuery = async () => {
    if (!mainQuery) return
    let filterValue
    if (mainQuery.operation === "org_units") {
      filterValue = { uuids: orgUnit?.uuid }
    } else if (mainQuery.operation === "itusers") {
      // TODO: Need to do 2 queries somehow, otherwise we don't get the actual itusers of the unit.
      filterValue = { engagement: { org_unit: { uuids: orgUnit?.uuid } } }
    } else {
      filterValue = { org_unit: { uuids: orgUnit?.uuid } }
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
    // This will never happen, but is needed to satisfy TypeScript as mainQuery in theory can be `undefined`
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
    orgUnit = undefined
  }
</script>

<HeadTitle type="insight" />

<div class="px-12 pt-6">
  <h1 class="mb-4">Insights</h1>
</div>
<div class="px-12 pt-6">
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded p-6 mb-4">
    <!-- TODO: Sort items -->
    <div class="flex flex-row gap-6">
      <InsightsSelect
        title={capital($_("main_query"))}
        id="main-query"
        iterable={mainQueries}
        bind:value={mainQuery}
        extra_classes="basis-1/2"
        isClearable={true}
        required={true}
      />
      <Search
        type="org-unit"
        bind:value={orgUnit}
        extra_classes="basis-1/2"
        required={true}
      />
    </div>
    <InsightsSelectMultiple
      title={capital($_("fields"))}
      id="fields"
      iterable={mainQuery ? mainQuery.fields : undefined}
      bind:value={chosenFields}
      required={true}
    />
    <!-- Added debounce to avoid spamming queries -->
    <button
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      disabled={!mainQuery || !orgUnit || !chosenFields.length}
      on:click={async () => debounce(updateQuery)}>{capital($_("search"))}</button
    >
    <button
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      on:click={() => clearFilter()}>{capital($_("clear"))}</button
    >
    <div class="divider p-0 m-0 my-2 w-full" />
    <Input
      title={capital($_("filename"))}
      id="filename"
      bind:value={filename}
      placeholder={$_("default_filename")}
    />
    <button
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      disabled={!data}
      on:click={(event) => downloadHandler(event, data, chosenFields, filename)}
      >{capital($_("download_as_csv"))}</button
    >
  </div>

  {#key data}
    <InsightsTable {data} headers={chosenFields} />
  {/key}
</div>
