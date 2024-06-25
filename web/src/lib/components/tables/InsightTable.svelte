<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { gql } from "graphql-request"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import { onMount } from "svelte"
  import { engagements } from "$lib/stores/csv"

  export let name: string, jobFunctionUuid: string, orgUnitUuid: string

  // As of now, the query is slow when it includes "query". My guess is that it's the nested filters in `job_function` that does this.
  // Both `null` and `""` makes it slow.

  gql`
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

  $: {
    if ($engagements) {
      $engagements = sortData($engagements, $sortKey, $sortDirection)
    }
  }
</script>

{#if !$engagements}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each $engagements as engagement, i}
    {#if engagement}
      {#key $engagements}
        <tr
          class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
      py-4 leading-5 border-t border-slate-300 text-secondary"
        >
          <td class="text-sm p-4">
            {engagement.person[0].name}
          </td>
          <td class="text-sm p-4">
            {engagement.job_function.name}
          </td>
          <td class="text-sm p-4">
            {engagement.org_unit[0].name}
          </td>
          <td class="text-sm p-4">
            {#if engagement.org_unit[0].managers.length}
              {#each engagement.org_unit[0].managers as manager}
                <p>
                  {manager.person?.[0].name}
                </p>
              {/each}
            {/if}
          </td>
          <ValidityTableCell validity={engagement.validity} />
        </tr>
      {/key}
    {/if}
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <!-- TODO: Add translated "No <type> in <tense>"-message" -->
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("employee", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
