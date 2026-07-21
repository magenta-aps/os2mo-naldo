<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { ItAssociationsDocument, type ItAssociationsQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/utils/validities"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  export let tense: Tense

  type ItAssociations = ItAssociationsQuery["associations"]["objects"][0]["validities"]

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
            org_unit_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            job_function_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            primary_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            it_user_response {
              uuid
              current(at: $fromDate) {
                itsystem_response {
                  uuid
                  current(at: $fromDate) {
                    name
                  }
                }
                user_key
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

  $: dataPromise = graphQLClient().request(ItAssociationsDocument, {
    employee: uuid,
    ...tenseToValidity(tense, $date),
  }).then((res) => {
    const itAssociations: ItAssociations = []

    // Filters and flattens the data
    for (const outer of res.associations.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      itAssociations.push(...filtered)
    }
    return itAssociations
  })
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  {#each sortData(data, $sortKey, $sortDirection) as itassociation, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
      leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        <a
          href="{base}/organisation/{itassociation.org_unit_response.uuid}"
          on:click={() => updateGlobalNavigation(itassociation.org_unit_response.uuid)}
        >
          {itassociation.org_unit_response.current?.name ??
            itassociation.org_unit_response.uuid}
        </a>
      </td>
      <td class="text-sm p-4">{itassociation.job_function_response?.current?.name}</td>
      <td class="text-sm p-4"
        >{itassociation.it_user_response?.current?.itsystem_response?.current?.name}</td
      >
      <td class="text-sm p-4">{itassociation.it_user_response?.current?.user_key}</td>
      <td class="text-sm p-4">{itassociation.primary_response?.current?.name ?? ""}</td>
      <ValidityTableCell validity={itassociation.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${itassociation.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/employee/{uuid}/edit/itassociation/{itassociation.uuid}{formatQueryDates(
            itassociation.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a href="{base}/employee/{uuid}/terminate/itassociation/{itassociation.uuid}">
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("itassociation", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{:catch}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("load_error"))}</td>
  </tr>
{/await}
