<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import {
    OrgUnitManagersDocument,
    EmployeeManagersDocument,
    type OrgUnitManagersQuery,
    type EmployeeManagersQuery,
  } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
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
  import { env } from "$env/dynamic/public"

  let inheritManager: boolean | undefined

  // FIX: On reload, this doesn't work
  $: if ($MOConfig) {
    if ($MOConfig.confdb_inherit_manager === "false") {
      inheritManager = false
    }
  }

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.route.id?.startsWith("/organisation")

  type Managers =
    | EmployeeManagersQuery["employees"]["objects"][0]["validities"][0]["managers"]
    | OrgUnitManagersQuery["org_units"]["objects"][0]["validities"][0]["managers"]
  let data: Managers

  // TODO: When/If GraphQL support searching for `inherited managers` on top-level `managers`, revert to this commit

  gql`
    query OrgUnitManagers(
      $uuids: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $inherit: Boolean = true
    ) {
      org_units(filter: { uuids: $uuids }) {
        objects {
          validities {
            managers(
              filter: { from_date: $fromDate, to_date: $toDate }
              inherit: $inherit
            ) {
              uuid
              person {
                name
                uuid
              }
              org_unit {
                name
                uuid
              }
              manager_level {
                name
              }
              manager_type {
                name
              }
              responsibilities {
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
    }

    query EmployeeManagers($fromDate: DateTime, $toDate: DateTime, $uuids: [UUID!]) {
      employees(filter: { uuids: $uuids }) {
        objects {
          validities {
            managers: manager_roles(
              filter: { from_date: $fromDate, to_date: $toDate }
            ) {
              uuid
              person {
                name
                uuid
              }
              org_unit {
                name
                uuid
              }
              manager_level {
                name
              }
              manager_type {
                name
              }
              responsibilities {
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
    }
  `

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const managers: Managers = []

    if (isOrg) {
      const res = await graphQLClient().request(OrgUnitManagersDocument, {
        uuids: uuid,
        inherit: inheritManager,
        ...tenseToValidity(tense, $date),
      })

      // Filters and flattens the data
      for (const outer of res.org_units.objects[0].validities) {
        // TODO: Remove when GraphQL is able to do this for us
        const filtered = outer.managers.filter((obj) => {
          return tenseFilter(obj, tense)
        })
        managers.push(...filtered)
      }
      data = managers
    } else {
      const res = await graphQLClient().request(EmployeeManagersDocument, {
        uuids: uuid,
        ...tenseToValidity(tense, $date),
      })
      // Filters and flattens the data
      for (const outer of res.employees.objects[0].validities) {
        // TODO: Remove when GraphQL is able to do this for us
        const filtered = outer.managers.filter((obj) => {
          return tenseFilter(obj, tense)
        })
        managers.push(...filtered)
      }
      data = managers
    }
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as orgOrEmployee}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4">
        {#if isOrg}
          {#if orgOrEmployee.person}
            <a href="{base}/employee/{orgOrEmployee.person[0].uuid}">
              {orgOrEmployee.person[0].name}
            </a>
          {:else}
            {capital($_("vacant"))}
          {/if}
          <!-- Add (*) if manager-object is inherited -->
          {#if orgOrEmployee.org_unit[0].uuid !== $page.params.uuid}
            <span
              title={capital(
                $_("inherited_manager", {
                  values: { org_unit: orgOrEmployee.org_unit[0].name },
                })
              )}>(*)</span
            >
          {/if}
        {:else}
          <a
            href="{base}/organisation/{orgOrEmployee.org_unit[0].uuid}"
            on:click={() => updateGlobalNavigation(orgOrEmployee.org_unit[0].uuid)}
          >
            {orgOrEmployee.org_unit[0].name}
          </a>
        {/if}
      </td>
      <td class="text-sm p-4">
        <ul>
          {#each orgOrEmployee.responsibilities as responsibility}
            <li>
              • {responsibility.name}
            </li>
          {/each}
        </ul>
      </td>
      <td class="text-sm p-4">{orgOrEmployee.manager_type.name}</td>
      <td class="text-sm p-4">{orgOrEmployee.manager_level.name}</td>
      <ValidityTableCell validity={orgOrEmployee.validity} />
      {#if env.PUBLIC_AUDITLOG === "true"}
        <td>
          <a href={`${base}/auditlog/${orgOrEmployee.uuid}`}>
            <Icon icon={historyRounded} width="25" height="25" />
          </a>
        </td>
      {/if}
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/edit/manager/{orgOrEmployee.uuid}{formatQueryDates(
            orgOrEmployee.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/terminate/manager/{orgOrEmployee.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("manager", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
