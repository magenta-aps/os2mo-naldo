<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { AssociationsDocument, type AssociationsQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { MOConfig } from "$lib/stores/config"

  type Associations = AssociationsQuery["associations"]["objects"][0]["objects"]
  let data: Associations

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  gql`
    query Associations(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      associations(
        filter: {
          employees: $employee
          it_association: false
          org_units: $org_unit
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          objects {
            uuid
            org_unit {
              name
              uuid
            }
            employee {
              name
              uuid
            }
            association_type {
              name
            }
            primary {
              name
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
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(AssociationsDocument, {
      org_unit: org_unit,
      employee: employee,
      ...tenseToValidity(tense, $date),
    })
    const associations: Associations = []

    // Filters and flattens the data
    for (const outer of res.associations.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      associations.push(...filtered)
    }
    data = associations
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as association}
    <!-- some py-4 others p-4 -->
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      {#if isOrg}
        <a href="{base}/employee/{association.employee[0].uuid}">
          <td class="p-4">{association.employee[0].name}</td>
        </a>
      {:else}
        <a href="{base}/organisation/{association.org_unit[0].uuid}">
          <td class="p-4">{association.org_unit[0].name}</td>
        </a>
      {/if}
      <td class="p-4">{association.association_type?.name}</td>
      {#if $MOConfig && $MOConfig.confdb_show_primary_association === "true"}
        <td class="p-4">{association.primary ? association.primary?.name : ""}</td>
      {/if}
      <ValidityTableCell validity={association.validity} />
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/edit/association/{association.uuid}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/terminate/association/{association.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <!-- TODO: Add translated "No associations in <tense>"-message" -->
      <td class="p-4"
        >{capital(
          $_("no_item", { values: { item: $_("association", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
