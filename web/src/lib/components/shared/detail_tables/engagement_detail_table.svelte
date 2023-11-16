<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
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

  type Engagements = EngagementsQuery["engagements"]["objects"][0]["objects"]
  let data: Engagements

  export let uuid: string
  export let tense: Tense

  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null
  const headers = [
    isOrg ? { title: "Navn" } : { title: "Enhed" },
    { title: "Stillingbetegnelse" },
    { title: "Engagementstype" },
    { title: "Primær" },
    { title: "Dato" },
    { title: "" },
    { title: "" },
  ]

  // Bør vi ikke tilføje noget tid til de her queries?
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

<DetailTable {headers}>
  {#if !data}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:else}
    {#each data as engagement}
      <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
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
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a
            href="{base}/{$page.route.id?.split(
              '/'
            )[1]}/{uuid}/terminate/engagement/{engagement.uuid}"
          >
            <Icon type="xmark" size="30" />
          </a>
        </td>
      </tr>
    {/each}
  {/if}
</DetailTable>
