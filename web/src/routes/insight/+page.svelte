<script lang="ts">
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import InsightTable from "$lib/components/tables/InsightTable.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { GetClassesDocument } from "./query.generated"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/search.svelte"
  import { engagements } from "$lib/stores/csv"
  import { downloadHandler } from "$lib/util/csv"

  let name: string,
    jobFunction: { uuid: string; name: string; user_key?: string | null },
    jobFunctionUuid: string,
    orgUnit: { uuid: string; name: string; user_key?: string | null },
    orgUnitUuid: string

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
</script>

<HeadTitle type="insight" />

<div class="px-12 pt-6">
  <h1 class="mb-4">Insights</h1>
  {#await graphQLClient().request(GetClassesDocument)}
    <!-- TODO: Should have a skeleton for the loading stage -->
    Henter data...
  {:then data}
    {@const facets = data.facets.objects}
    <div class="collapse bg-slate-100 rounded shadow-sm my-4">
      <input type="checkbox" />
      <div class="collapse-title">Filter</div>
      <div class="collapse-content">
        <div class="grid grid-cols-4 gap-4">
          <Input title="Navn" id="filter-name" bind:value={name} />
          <Select
            title="Stillingsbetegnelse"
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
  {/await}

  <button
    class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
    disabled={!$engagements.length}
    on:click={(event) => downloadHandler(event, $engagements, allPossibleHeaders)}
    >Download CSV</button
  >
</div>
