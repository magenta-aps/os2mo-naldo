<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { query } from "gql-query-builder"
  import Selects from "$lib/components/insights/Selects.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import { debounce, paginateQuery } from "$lib/util/helpers"
  import { graphQLClient } from "$lib/util/http"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/Search.svelte"
  import type { SelectedQuery } from "$lib/util/helpers"
  import { downloadHandler } from "$lib/util/csv"
  import Icon from "@iconify/svelte"
  import homeOutlineRounded from "@iconify/icons-material-symbols/home-outline-rounded"
  import { warning } from "$lib/stores/alert"
  import homeWorkOutlineRounded from "@iconify/icons-material-symbols/home-work-outline-rounded"
  import removeRounded from "@iconify/icons-material-symbols/remove-rounded"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import { mainQueries } from "./mainQueries"
  import { onDestroy } from "svelte"
  import { gql } from "graphql-request"
  import { GetOrgUnitCountDocument } from "./query.generated"

  let orgUnit: { name: string; uuid: string } | undefined
  let data: any
  let filename: string
  let loading = false
  // Random variable, is only used to trigger updates in `Selects`
  let removed = 0
  let includeChildren: boolean
  let controller: AbortController
  let requestCount = 0
  let totalCount: number = 0
  let startTime: number = 0
  let estimatedTime: string

  // This is used to cancel ongoing request and break out of the loop, when navigating away from the page.
  onDestroy(() => {
    controller.abort()
  })

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
  const estimateTimeRemaining = (
    totalCount: number,
    requestCount: number,
    startTime: number
  ) => {
    const elapsedTime = (Date.now() - startTime) / 1000 // Elapsed time in seconds
    const averageTimePerRequest = elapsedTime / requestCount // Average time per request
    const remainingRequests = totalCount - requestCount

    const estimatedSecondsRemaining = Math.round(
      averageTimePerRequest * remainingRequests
    )
    const minutes = Math.floor(estimatedSecondsRemaining / 60)
    const seconds = estimatedSecondsRemaining % 60

    return `${minutes}m ${seconds}s`
  }

  const fetchTotalCount = async (filter: any) => {
    gql`
      query GetOrgUnitCount($date: DateTime, $filter: OrganisationUnitFilter) {
        org_units(filter: $filter) {
          objects {
            current(at: $date) {
              uuid
            }
          }
        }
      }
    `
    const res = await graphQLClient().request(GetOrgUnitCountDocument, {
      filter: filter,
      date: $date,
    })
    return res.org_units.objects.length
  }

  const updateQuery = async () => {
    if (!selectedQueries) return
    loading = true
    // Reset estimate variables. This is mainly for the case where we start a 2nd download.
    startTime = Date.now()
    estimatedTime = `${capital($_("calculating"))}...`
    requestCount = 0
    totalCount = 0
    let filterValue = includeChildren
      ? {
          ancestor: { uuids: orgUnit?.uuid, from_date: $date, to_date: null },
          from_date: $date,
          to_date: null,
        }
      : { uuids: orgUnit?.uuid, from_date: $date, to_date: null }

    if (includeChildren) {
      totalCount = await fetchTotalCount(filterValue)
      startTime = Date.now()
      estimatedTime = estimateTimeRemaining(totalCount, requestCount, startTime)
    }

    const gqlQuery = query([
      {
        operation: "page: org_units",
        variables: {
          filter: {
            value: filterValue,
            type: "OrganisationUnitFilter",
          },
          limit: {
            value: null,
            type: "int",
          },
          cursor: {
            value: null,
            type: "Cursor",
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
                        [`${query.mainQuery.operation}(filter: { from_date: $date, to_date: null })`]:
                          query.chosenFields.map((field) => field.subString),
                      }
                      // If operation === org_units, we just add the fields directly - if !mainQuery -> skip
                    } else {
                      return query.chosenFields.map((field) => field.subString ?? "")
                    }
                  })
                  .flat(),
              },
            ],
            page_info: ["next_cursor"],
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

    if (controller) {
      controller.abort()
    }
    controller = new AbortController()
    const abortSignal = controller.signal

    const res = await paginateQuery(
      generatedQuery.query,
      generatedQuery.variables,
      // Limit
      1,
      (currentRequestCount) => {
        requestCount = currentRequestCount
      },
      abortSignal
    )

    if (abortSignal.aborted) {
      throw new Error("CSV download was aborted")
    }

    const results = []
    for (const outer of res) {
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

  const updateEstimatedTime = () => {
    estimatedTime = estimateTimeRemaining(totalCount, requestCount, startTime)
  }
  $: if (requestCount) {
    updateEstimatedTime()
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
      <div class="form-control pb-3">
        <div class="pb-1 text-secondary">
          <label for="includeChildren" class="text-sm text-secondary pb-1">
            {$_("include_children_text")}
          </label>
          <div>
            <button
              on:click={() => {
                includeChildren = false
              }}
              class="text-secondary"
            >
              <Icon icon={homeOutlineRounded} width="25" height="25" />
            </button>
            <input
              id="includeChildren"
              type="checkbox"
              class="toggle bg-secondary hover:bg-secondary"
              bind:checked={includeChildren}
            />

            <button
              on:click={() => {
                includeChildren = true
              }}
              class="text-secondary"
            >
              <Icon icon={homeWorkOutlineRounded} width="25" height="25" />
            </button>
          </div>
        </div>
      </div>
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
        !orgUnit ||
        loading}
      on:click={async (event) => {
        try {
          await debounce(updateQuery)
          downloadHandler(event, data, selectedQueries, filename)
        } catch (warn) {
          // Catch if the csv download is aborted
          console.log(warn)
          $warning = { message: capital($_("csv_warning")) }
        }
      }}
      >{capital($_("download_as_csv"))}
      {#if loading}<span class="loading loading-spinner" />{/if}</button
    >{#if loading && estimatedTime}
      <div class="normal-case font-normal text-base text-base-100">
        <p>{`${capital($_("estimated_time_remaining"))}: ${estimatedTime}`}</p>
        <p>
          {`${requestCount} ${$_("of")} ${totalCount} ${$_("unit", {
            values: { n: 2 },
          })}`}
        </p>
      </div>
      <p class="text-secondary text-xs">* {capital($_("insights_note"))}</p>
    {/if}
  </div>
</div>
