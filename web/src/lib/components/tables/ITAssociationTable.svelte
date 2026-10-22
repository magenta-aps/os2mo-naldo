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
  import { findClosestValidityWithin, formatQueryDates } from "$lib/utils/validities"
  import NameWithHistory from "$lib/components/shared/NameWithHistory.svelte"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  export let tense: Tense

  type ItAssociation =
    ItAssociationsQuery["associations"]["objects"][0]["validities"][0]
  type ItUserState = NonNullable<ItAssociation["it_user_response"]>["validities"][0]
  // Names precomputed so column sorting matches the displayed names
  type ItAssociations = (ItAssociation & {
    org_unit_name?: string | null
    it_user_state?: ItUserState | null
    it_user_name?: string | null
    itsystem_name?: string | null
  })[]

  const uuid = $page.params.uuid

  gql`
    query ITAssociations($employee: [UUID!]!, $fromDate: DateTime, $toDate: DateTime) {
      associations(
        filter: {
          employee: { uuids: $employee }
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
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
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
              validities(start: null, end: null) {
                # The account name, under the name NameWithHistory reads
                name: user_key
                itsystem_response {
                  uuid
                  validities(start: null, end: null) {
                    name
                    validity {
                      from
                      to
                    }
                  }
                }
                validity {
                  from
                  to
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

  $: dataPromise = graphQLClient()
    .request(ItAssociationsDocument, {
      employee: uuid,
      ...tenseToValidity(tense, $date),
    })
    .then((res) => {
      const itAssociations: ItAssociations = []

      // Filters and flattens the data
      for (const outer of res.associations.objects) {
        // TODO: Remove when GraphQL is able to do this for us
        const filtered = outer.validities.filter((obj) => {
          return tenseFilter(obj, tense)
        })
        itAssociations.push(
          ...filtered.map((obj) => {
            const itUserState = findClosestValidityWithin(
              obj.it_user_response?.validities,
              obj.validity,
              $date
            )
            return {
              ...obj,
              org_unit_name: findClosestValidityWithin(
                obj.org_unit_response.validities,
                obj.validity,
                $date
              )?.name,
              it_user_state: itUserState,
              it_user_name: itUserState?.name,
              itsystem_name: findClosestValidityWithin(
                itUserState?.itsystem_response.validities,
                obj.validity,
                $date
              )?.name,
            }
          })
        )
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
        <NameWithHistory
          id="{itassociation.uuid}-org-unit"
          validities={itassociation.org_unit_response.validities}
          rowValidity={itassociation.validity}
          fallback={itassociation.org_unit_response.uuid}
          href="{base}/organisation/{itassociation.org_unit_response.uuid}"
          on:click={() => updateGlobalNavigation(itassociation.org_unit_response.uuid)}
        />
      </td>
      <td class="text-sm p-4">{itassociation.job_function_response?.current?.name}</td>
      <td class="text-sm p-4">
        {#if itassociation.it_user_state}
          <NameWithHistory
            id="{itassociation.uuid}-itsystem"
            validities={itassociation.it_user_state.itsystem_response.validities}
            rowValidity={itassociation.validity}
            fallback={itassociation.it_user_state.itsystem_response.uuid}
          />
        {/if}
      </td>
      <td class="text-sm p-4">
        {#if itassociation.it_user_response}
          <NameWithHistory
            id="{itassociation.uuid}-it-user"
            validities={itassociation.it_user_response.validities}
            rowValidity={itassociation.validity}
            fallback={itassociation.it_user_response.uuid}
          />
        {/if}
      </td>
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
