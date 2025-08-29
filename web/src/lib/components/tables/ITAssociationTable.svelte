<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { ItAssociationsDocument, type ItAssociationsQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { findClosestValidity, tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/util/helpers"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  export let tense: Tense

  type ItAssociations = ItAssociationsQuery["associations"]["objects"][0]["validities"]
  let data: ItAssociations

  const uuid = $page.params.uuid

  gql`
    query ITAssociations($employee: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      associations(
        filter: {
          employees: $employee
          it_association: true
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          validities {
            uuid
            org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
              validity {
                from
                to
              }
            }
            job_function {
              name
            }
            primary {
              name
            }
            it_user(filter: { from_date: $fromDate, to_date: $toDate }) {
              itsystem {
                name
              }
              user_key
              validity {
                from
                to
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
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(ItAssociationsDocument, {
      employee: uuid,
      ...tenseToValidity(tense, $date),
    })
    const itAssociations: ItAssociations = []

    // Filters and flattens the data
    for (const outer of res.associations.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      itAssociations.push(...filtered)
    }
    data = itAssociations
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as itassociation, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
      leading-5 border-t border-slate-300 text-secondary"
    >
      <td class="text-sm p-4">
        <a
          href="{base}/organisation/{itassociation.org_unit[0].uuid}"
          on:click={() => updateGlobalNavigation(itassociation.org_unit[0].uuid)}
        >
          {findClosestValidity(itassociation.org_unit, $date).name}
        </a>
      </td>
      <td class="text-sm p-4">{itassociation.job_function?.name}</td>
      <td class="text-sm p-4"
        >{findClosestValidity(itassociation.it_user, $date).itsystem.name}</td
      >
      <td class="text-sm p-4"
        >{findClosestValidity(itassociation.it_user, $date).user_key}</td
      >
      <td class="text-sm p-4"
        >{itassociation.primary ? itassociation.primary?.name : ""}</td
      >
      <ValidityTableCell validity={itassociation.validity} />
      {#if env.PUBLIC_AUDITLOG}
        <td>
          <a href={`${base}/auditlog/${itassociation.uuid}`}>
            <Icon icon={historyRounded} width="25" height="25" />
          </a>
        </td>
      {/if}
      <td>
        <a
          href="{base}/employee/{uuid}/edit/itassociation/{itassociation.uuid}{formatQueryDates(
            itassociation.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a href="{base}/employee/{uuid}/terminate/itassociation/{itassociation.uuid}">
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("itassociation", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
