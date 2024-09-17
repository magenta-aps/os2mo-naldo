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
  let loading = false
  // Random variable, is only used to trigger updates in `Selects`
  let removed = 0

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
    removed++
  }

  const updateQuery = async () => {
    if (!selectedQueries) return
    loading = true
    let filterValue = {
      goodname: { uuids: orgUnit?.uuid, from_date: null, to_date: null },
    }
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
    data = await getData(gqlQuery)
    loading = false
  }

  const getData = async (generatedQuery: {
    query: string
    variables: { filter: object }
  }) => {
    if (!selectedQueries || !generatedQuery) return
    const res: any = await graphQLClient().request(
      generatedQuery.query,
      generatedQuery.variables
    )

    const results = []
    for (const outer of res.org_units.objects) {
      results.push(outer.current)
    }
    return results
  }

  const clearFilter = () => {
    data = null
    orgUnit = undefined
    selectedQueries = [
      {
        mainQuery: undefined,
        chosenFields: [],
      },
    ]
    removed++
  }
</script>

<HeadTitle type="insights" />

<div class="px-12 pt-6">
  <h1 class="mb-4">{capital($_("insights"))}</h1>
</div>
<div class="px-12 pt-6">
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded p-6 mb-4">
    <div>
      <Search
        type="org-unit"
        title={capital($_("org_unit", { values: { n: 1 } }))}
        bind:value={orgUnit}
        required={true}
      />

      {#key removed}
        {#each selectedQueries as querySet, index}
          <Selects {mainQueries} {querySet} {index} bind:data={selectedQueries} />
          {#if selectedQueries.length > 1}
            <button
              class="btn btn-xs btn-circle btn-primary normal-case font-normal text-base text-base-100"
              on:click={() => removeSelect(index)}
              ><Icon icon={removeRounded} width="20" height="20" /></button
            >
          {/if}
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
      {/key}
    </div>
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
      disabled={selectedQueries.some(
        (selectedQuery) =>
          selectedQuery.mainQuery === null || selectedQuery.mainQuery === undefined
      ) ||
        selectedQueries[selectedQueries.length - 1].mainQuery === null ||
        !orgUnit}
      on:click={async (event) => {
        await debounce(updateQuery)
        downloadHandler(event, data, selectedQueries, filename)
      }}
      >{capital($_("download_as_csv"))}
      {#if loading}<span class="loading loading-spinner" />{/if}</button
    >
  </div>

  <!-- {#key data}
    <InsightsTable {data} headers={selectedQueries} />
  {/key} -->
</div>
