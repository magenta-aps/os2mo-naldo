<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import {
    EmployeeAndOrgRolesDocument,
    type EmployeeAndOrgRolesQuery,
  } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"

  type Roles = EmployeeAndOrgRolesQuery["roles"]["objects"][0]["objects"]
  let data: Roles

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  gql`
    query EmployeeAndOrgRoles(
      $employee_uuid: [UUID!]
      $org_uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      roles(
        filter: {
          employees: $employee_uuid
          org_units: $org_uuid
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          objects {
            uuid
            role_type {
              name
            }
            validity {
              from
              to
            }
            employee {
              name
              uuid
            }
            org_unit {
              name
              uuid
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
    const res = await graphQLClient().request(EmployeeAndOrgRolesDocument, {
      org_uuid: org_unit,
      employee_uuid: employee,
      ...tenseToValidity(tense, $date),
    })
    const roles: Roles = []

    // Filters and flattens the data
    for (const outer of res.roles.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      roles.push(...filtered)
    }
    data = roles
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as role}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      {#if isOrg}
        <a href="{base}/employee/{role.employee[0].uuid}">
          <td class="p-4">{role.employee[0].name}</td>
        </a>
      {:else}
        <a href="{base}/organisation/{role.org_unit[0].uuid}">
          <td class="p-4">
            {role.org_unit[0].name}
          </td>
        </a>
      {/if}
      <td class="p-4">{role.role_type.name}</td>
      <ValidityTableCell validity={role.validity} />
      <td>
        <a
          aria-disabled
          href="{base}/{$page.route.id?.split('/')[1]}/{uuid}/edit/role/{role.uuid}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/terminate/role/{role.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <!-- TODO: Add translated "No roles in <tense>"-message" -->
      <td class="p-4"
        >{capital(
          $_("no_item", { values: { item: $_("role", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
