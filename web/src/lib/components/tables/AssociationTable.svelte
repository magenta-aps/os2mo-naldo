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
  import { findClosestValidity, tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/util/helpers"
  import { MOConfig } from "$lib/stores/config"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  type Associations = AssociationsQuery["associations"]["objects"][0]["validities"]
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
            person(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
              validity {
                from
                to
              }
            }
            association_type {
              name
            }
            trade_union {
              name
            }
            substitute(filter: { from_date: $fromDate, to_date: $toDate }) {
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
      const filtered = outer.validities.filter((obj) => {
        if (!tenseFilter(obj, tense)) return false
        // Check if association validity is in current org_unit ($page.params.uuid)
        // TODO: Do this with GraphQL, when following issues are resolved (#65031) (#65303)
        if (isOrg && obj.org_unit[0].uuid !== $page.params.uuid) return false
        return true
      })
      associations.push(...filtered)
    }
    data = associations
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as association, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
      leading-5 border-t border-slate-300 text-secondary"
    >
      <td class="text-sm p-4">
        {#if isOrg}
          <!-- GraphQL and Naldo doesn't allow creating vacant associations, but the old frontend did -->
          <!-- This means that some customers might have them, and therefore we need this check. -->
          {#if association.person[0]?.name}
            <a href="{base}/employee/{association.person[0].uuid}">
              {findClosestValidity(association.person, $date).name}
            </a>
          {:else}
            {capital($_("vacant"))}
          {/if}
        {:else}
          <a
            href="{base}/organisation/{association.org_unit[0].uuid}"
            on:click={() => updateGlobalNavigation(association.org_unit[0].uuid)}
          >
            {findClosestValidity(association.org_unit, $date).name}</a
          >
        {/if}
      </td>
      <td class="text-sm p-4">{association.association_type?.name}</td>
      <td class="text-sm p-4"
        >{association.substitute[0] ? association.substitute[0].name : ""}</td
      >
      {#if $MOConfig && JSON.parse($MOConfig.confdb_association_dynamic_facets)}
        <td class="text-sm p-4"
          >{association.trade_union ? association.trade_union?.name : ""}</td
        >
      {/if}
      {#if $MOConfig && $MOConfig.confdb_show_primary_association === "true"}
        <td class="text-sm p-4"
          >{association.primary ? association.primary?.name : ""}</td
        >
      {/if}
      <ValidityTableCell validity={association.validity} />
      {#if env.PUBLIC_AUDITLOG}
        <td>
          <a href={`${base}/auditlog/${association.uuid}`}>
            <Icon icon={historyRounded} width="25" height="25" />
          </a>
        </td>
      {/if}
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/edit/association/{association.uuid}{formatQueryDates(
            association.validity
          )}"
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
    <tr class="leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("association", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
