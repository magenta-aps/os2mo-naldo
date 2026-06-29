<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { onMount } from "svelte"
  import { PoliciesDocument, type PoliciesQuery } from "./query.generated"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"

  type Policies = PoliciesQuery["policies"]["objects"]
  let data: Policies | undefined

  gql`
    query Policies {
      policies {
        objects {
          uuid
          name
          description
          start
          end
        }
      }
    }
  `

  $: headers = [
    { title: capital($_("name")), sortPath: "name" },
    { title: capital($_("description")), sortPath: "description" },
    { title: capital($_("date.date")), sortPath: "start" },
  ]

  $: if (data) {
    data = sortData(data, $sortKey, $sortDirection)
  }

  onMount(async () => {
    const res = await graphQLClient().request(PoliciesDocument)
    data = res.policies.objects
  })
</script>

<DetailTable {headers}>
  {#if !data}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4">{capital($_("loading"))}</td>
    </tr>
  {:else}
    {#each data as policy, i}
      <tr
        class="{i % 2 === 0 ? '' : 'bg-base-200'}
          leading-5 border-t border-base-300 text-base-content"
      >
        <td class="text-sm p-4">{policy.name}</td>
        <td class="text-sm p-4">{policy.description ?? ""}</td>
        <ValidityTableCell validity={{ from: policy.start, to: policy.end }} />
      </tr>
    {:else}
      <tr class="leading-5 border-t border-base-300 text-base-content">
        <td class="text-sm p-4"
          >{capital(
            $_("no_item", { values: { item: $_("policies", { values: { n: 2 } }) } })
          )}</td
        >
      </tr>
    {/each}
  {/if}
</DetailTable>
