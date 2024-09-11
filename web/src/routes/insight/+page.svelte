<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { query } from "gql-query-builder"
  import Selects from "$lib/components/insights/Selects.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import { debounce } from "$lib/util/helpers"
  import { graphQLClient } from "$lib/util/http"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/Search.svelte"
  import type { SelectedQuery } from "$lib/util/helpers"
  import { downloadHandler } from "$lib/util/csv"
  import Icon from "@iconify/svelte"
  import removeRounded from "@iconify/icons-material-symbols/remove-rounded"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import { mainQueries } from "./mainQueries"

  let orgUnit: { name: string; uuid: string } | undefined
  let data: any
  let filename: string

  let selectedQueries: SelectedQuery[] = [
    {
      mainQuery: undefined,
      chosenFields: [],
    },
  ]

  const addNewSelect = () => {
    selectedQueries = [
      ...selectedQueries,
      {
        mainQuery: undefined,
        chosenFields: [],
      },
    ]
  }

  const removeSelect = (index: number) => {
    selectedQueries = selectedQueries.filter((_, i) => i !== index)
  }

  const updateQuery = async () => {
    if (!selectedQueries) return
    let filterValue = { uuids: orgUnit?.uuid, from_date: null, to_date: null }
    const gqlQuery = query([
      {
        operation: "org_units",
        variables: {
          filter: {
            value: filterValue,
            type: "OrganisationUnitFilter",
          },
        },
        fields: [
          {
            objects: [
              {
                operation: "current",
                variables: { date: { name: "at", value: $date, type: "DateTime" } },
                fields: selectedQueries
                  .map((query) => {
                    // If mainQuery.operation is not org_units, we insert the operation e.g. `engagements {...}`
                    if (query.mainQuery && query.mainQuery.operation !== "org_units") {
                      return {
                        [query.mainQuery.operation]: query.chosenFields.map(
                          (field) => field.subString
                        ),
                      }
                      // If operation === org_units, we just add the fields directly - if !mainQuery -> skip
                    } else {
                      return query.chosenFields.map((field) => field.subString ?? "")
                    }
                  })
                  .flat(),
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
    if (!selectedQueries || !generatedQuery) return
    const res = await graphQLClient().request(
      generatedQuery.query,
      generatedQuery.variables
    )

    data = res

    const results = []
    for (const outer of data.org_units.objects) {
      results.push(outer.current)
    }
    data = results
  }

  const clearFilter = () => {
    data = null
    orgUnit = undefined
    // TODO: selectedQueries are cleared, but the data is `Selects` are not updated,
    // so the multiSelect will still have the fields selected
    selectedQueries = [
      {
        mainQuery: undefined,
        chosenFields: [],
      },
    ]
  }
</script>

<HeadTitle type="insight" />

<div class="px-12 pt-6">
  <h1 class="mb-4">Insights</h1>
</div>
<div class="px-12 pt-6">
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded p-6 mb-4">
    <div>
      <!-- TODO: Sort items -->
      <Search
        type="org-unit"
        title={capital($_("org_unit", { values: { n: 1 } }))}
        bind:value={orgUnit}
        required={true}
      />
      {#each selectedQueries as querySet, index}
        <Selects {mainQueries} {querySet} {index} bind:data={selectedQueries} />
        <button
          class="btn btn-xs btn-circle btn-primary normal-case font-normal text-base text-base-100"
          on:click={() => removeSelect(index)}
          ><Icon icon={removeRounded} width="20" height="20" /></button
        >
        {#if index === selectedQueries.length - 1}
          <button
            class="btn btn-xs btn-circle btn-primary normal-case font-normal text-base text-base-100 mb-4"
            on:click={() => addNewSelect()}
            ><Icon icon={addRounded} width="20" height="20" /></button
          >
        {:else}
          <div class="divider p-0 m-0 my-2 w-full" />
        {/if}
      {/each}
    </div>
    <!-- Added debounce to avoid spamming queries -->
    <button
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      disabled={selectedQueries[selectedQueries.length - 1].mainQuery === undefined ||
        selectedQueries[selectedQueries.length - 1].mainQuery === null ||
        !orgUnit}
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
      on:click={(event) => downloadHandler(event, data, selectedQueries, filename)}
      >{capital($_("download_as_csv"))}</button
    >
  </div>

  <!-- {#key data}
    <InsightsTable {data} headers={selectedQueries} />
  {/key} -->
</div>
