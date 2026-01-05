<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { ManagersDocument, type ManagersQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { findClosestValidity } from "$lib/utils/validities"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { sortData } from "$lib/utils/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/utils/validities"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.url.pathname?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  type Managers = ManagersQuery["managers"]["objects"][0]["validities"]
  let data: Managers

  gql`
    query Managers(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $inherit: Boolean = true
    ) {
      managers(
        filter: {
          employees: $employee
          org_units: $org_unit
          from_date: $fromDate
          to_date: $toDate
        }
        inherit: $inherit
      ) {
        objects {
          validities {
            uuid
            person(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
              validity {
                from
                to
              }
            }
            org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
              validity {
                from
                to
              }
            }
            manager_level(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
            }
            manager_type(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
            }
            responsibilities(filter: { from_date: $fromDate, to_date: $toDate }) {
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
    const res = await graphQLClient().request(ManagersDocument, {
      org_unit: org_unit,
      employee: employee,
      // Don't set inherit flag if employee, to avoid:
      // "The inherit flag requires an organizational unit filter"
      inherit: !isOrg ? false : env.PUBLIC_INHERIT_MANAGER,
      ...tenseToValidity(tense, $date),
    })
    const managers: Managers = []

    // Filters and flattens the data
    for (const outer of res.managers.objects) {
      const filtered = outer.validities.filter((obj) => {
        if (!tenseFilter(obj, tense)) return false
        // Filter out vacant manager-roles for employees
        // TODO: Do this with GraphQL, when following issues are resolved (#65031) (#65303)
        if (!isOrg && !obj.person) return false
        return true
      })
      managers.push(...filtered)
    }
    data = managers
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as manager, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
      leading-5 border-t border-slate-300 text-secondary"
    >
      <td class="text-sm p-4">
        {#if isOrg}
          {#if manager.person}
            <a href="{base}/employee/{manager.person[0].uuid}">
              {findClosestValidity(manager.person, $date).name}
            </a>
          {:else}
            {capital($_("vacant"))}
          {/if}
          <!-- Add (*) if manager-object is inherited -->
          {#if manager.org_unit?.[0].uuid !== $page.params.uuid}
            <span
              title={capital(
                $_("inherited_manager", {
                  values: {
                    org_unit: findClosestValidity(manager.org_unit, $date).name,
                  },
                })
              )}>(*)</span
            >
          {/if}
        {:else}
          <a
            href="{base}/organisation/{manager.org_unit[0].uuid}"
            on:click={() => updateGlobalNavigation(manager.org_unit[0].uuid)}
          >
            {findClosestValidity(manager.org_unit, $date).name}
          </a>
        {/if}
      </td>
      <td class="text-sm p-4">
        <ul>
          {#each manager.responsibilities as responsibility}
            <li>
              • {responsibility.name}
            </li>
          {/each}
        </ul>
      </td>
      <td class="text-sm p-4">{manager.manager_type.name}</td>
      <td class="text-sm p-4">{manager.manager_level.name}</td>
      <ValidityTableCell validity={manager.validity} />
      <td>
        <a href={`${base}/auditlog/${manager.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/edit/manager/{manager.uuid}{formatQueryDates(manager.validity)}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/terminate/manager/{manager.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("manager", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
