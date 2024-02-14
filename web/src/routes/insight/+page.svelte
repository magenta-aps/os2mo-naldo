<script lang="ts">
  import { _ } from "svelte-i18n"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { date } from "$lib/stores/date"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import InsightTable from "$lib/components/tables/InsightTable.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import {
    GetClassesDocument,
    GetEngagementsDocument,
    type GetEngagementsQuery,
  } from "./query.generated"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/search.svelte"
  import { engagements } from "$lib/stores/csv"
  import { downloadHandler } from "$lib/util/csv"
  import { onMount } from "svelte"
  import { debounce } from "$lib/util/helpers"

  type Engagements = GetEngagementsQuery["engagements"]["objects"][0]["current"][]

  let name: string,
    jobFunction: { uuid: string; name: string; user_key?: string | null },
    jobFunctionUuid: string,
    orgUnit: { uuid: string; name: string; user_key?: string | null },
    orgUnitUuid: string

  const filterEngagements = async (
    name: string | undefined | null,
    jobFunctionUuid: string | undefined | null,
    orgUnitUuid: string | undefined | null
  ): Promise<Engagements> => {
    const res = await graphQLClient().request(GetEngagementsDocument, {
      queryString: name,
      jobFunction: jobFunctionUuid,
      orgUnit: orgUnitUuid,
      fromDate: $date,
    })
    const filteredEngagements: Engagements = []

    // Filters and flattens the data
    for (const outer of res.engagements.objects) {
      filteredEngagements.push(outer.current)
    }

    return ($engagements = filteredEngagements)
  }

  $: {
    jobFunctionUuid = jobFunction?.uuid
    orgUnitUuid = orgUnit?.uuid
  }

  gql`
    query GetClasses {
      facets(filter: { user_keys: "engagement_job_function" }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              uuid
              user_key
              name
            }
          }
        }
      }
    }

    query GetEngagements(
      $limit: int = 10
      $queryString: String
      $orgUnit: [UUID!]
      $jobFunction: [UUID!]
      $fromDate: DateTime
    ) {
      engagements(
        limit: $limit
        filter: {
          employee: { query: $queryString }
          org_unit: { uuids: $orgUnit }
          job_function: { uuids: $jobFunction }
          from_date: $fromDate
        }
      ) {
        objects {
          current {
            person {
              name
            }
            primary {
              name
            }
            job_function {
              name
            }
            org_unit {
              name
              managers {
                person {
                  name
                }
              }
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

  const allPossibleHeaders = [
    { key: "person.0.name", label: "Person Name" },
    { key: "primary.name", label: "Primary" },
    { key: "job_function.name", label: "Job Function Name" },
    { key: "org_unit.0.name", label: "Organization Unit Name" },
    { key: "org_unit.0.managers.0.person.0.name", label: "Manager Name" },
    { key: "validity.from", label: "Validity From" },
    { key: "validity.to", label: "Validity To" },
  ]

  onMount(async () => {
    $engagements = await filterEngagements(name, jobFunctionUuid, orgUnitUuid)
  })
</script>

<HeadTitle type="insight" />

<div class="px-12 pt-6 mb-5">
  <h1 class="mb-4">Insight</h1>
  {#await graphQLClient().request(GetClassesDocument)}
    <!-- TODO: Should have a skeleton for the loading stage -->
    Henter data...
  {:then data}
    {@const facets = data.facets.objects}
    <div class="collapse bg-slate-100 rounded shadow-sm my-4">
      <input type="checkbox" />
      <div class="collapse-title">
        <h3>Filter</h3>
      </div>
      <div class="collapse-content">
        <div class="grid grid-cols-4 gap-4">
          <Input title="Navn" id="filter-name" bind:value={name} />
          <Select
            title={$_("job_function")}
            id="filter-job-function"
            bind:value={jobFunction}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
          />
          <!-- TODO: Allow searching for multiple units -->
          <!-- TODO: Allow searching for children of x -->
          <Search
            type="org-unit"
            title="Enhed"
            id="filter-org-unit"
            bind:value={orgUnit}
          />
        </div>
        <button
          class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
          on:click={async () =>
            await debounce(filterEngagements, name, jobFunctionUuid, orgUnitUuid)}
          >Søg</button
        >
      </div>
    </div>

    <DetailTable
      headers={[
        { title: "Navn", sortPath: "person[0].name" },
        { title: "Stillingsbetegnelse" },
        { title: "Enhed" },
        { title: "Leder" },
        { title: "Dato" },
      ]}
    >
      <svelte:component this={InsightTable} {name} {jobFunctionUuid} {orgUnitUuid} />
    </DetailTable>
    <button
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      disabled={!$engagements.length}
      on:click={(event) => downloadHandler(event, $engagements, allPossibleHeaders)}
      >Download CSV</button
    >
  {/await}
</div>
