<script lang="ts">
  import { _ } from "svelte-i18n"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { EngagementsDocument, type EngagementsQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"

  type Engagements = EngagementsQuery["engagements"]["objects"][0]["objects"]
  let data: Engagements

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  gql`
    query Engagements(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      engagements(
        filter: {
          employees: $employee
          org_units: $org_unit
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          objects {
            uuid
            employee {
              uuid
              name
            }
            job_function {
              name
            }
            engagement_type {
              name
            }
            org_unit {
              name
              uuid
            }
            validity {
              from
              to
            }
            primary {
              name
            }
          }
        }
      }
    }
  `

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(EngagementsDocument, {
      org_unit: org_unit,
      employee: employee,
      ...tenseToValidity(tense, $date),
    })
    const engagements: Engagements = []

    // Filters and flattens the data
    for (const outer of res.engagements.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      engagements.push(...filtered)
    }
    data = engagements
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">Henter data...</td>
  </tr>
{:else}
  {#each data as engagement, i}
    <!-- TODO: If no engagements "No past engagements found"-ish -->
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
      py-4 leading-5 border-t border-slate-300 text-secondary"
    >
      {#if isOrg}
        <a href="{base}/employee/{engagement.employee[0].uuid}">
          <td class="p-4">{engagement.employee[0].name}</td>
        </a>
      {:else}
        <a href="{base}/organisation/{engagement.org_unit[0].uuid}">
          <td class="p-4">{engagement.org_unit[0].name}</td>
        </a>
      {/if}
      <td class="p-4">{engagement.job_function.name}</td>
      <td class="p-4">{engagement.engagement_type.name}</td>
      <td class="p-4">{engagement.primary ? engagement.primary.name : ""}</td>
      <ValidityTableCell validity={engagement.validity} />
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/edit/engagement/{engagement.uuid}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/terminate/engagement/{engagement.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <!-- TODO: Add translated "No engagements in <tense>"-message" -->
      <td class="p-4">Ingen engagementer</td>
    </tr>
  {/each}
{/if}
