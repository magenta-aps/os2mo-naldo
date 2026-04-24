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
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { sortData } from "$lib/utils/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import {
    lookupDate,
    findClosestValidity,
    formatQueryDates,
  } from "$lib/utils/validities"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.url.pathname?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  // Row validities are enriched post-fetch with a `current` field on each
  // related _response, resolved at the row's own `validity.from`.
  type Current<T> = T extends { validities: Array<infer V> } ? V : never
  type WithCurrent<T> = T extends null | undefined
    ? T
    : T & { current?: Current<T> | null }
  type Row = ManagersQuery["managers"]["objects"][0]["validities"][number]
  type EnrichedRow = Omit<
    Row,
    | "person_response"
    | "org_unit_response"
    | "manager_level_response"
    | "manager_type_response"
    | "responsibilities_response"
  > & {
    person_response: WithCurrent<Row["person_response"]>
    org_unit_response: WithCurrent<Row["org_unit_response"]>
    manager_level_response: WithCurrent<Row["manager_level_response"]>
    manager_type_response: WithCurrent<Row["manager_type_response"]>
    responsibilities_response: {
      objects: Array<WithCurrent<Row["responsibilities_response"]["objects"][number]>>
    }
  }
  type Managers = EnrichedRow[]
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
            person_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
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
            manager_level_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            manager_type_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            responsibilities_response {
              objects {
                uuid
                validities(start: null, end: null) {
                  name
                  validity {
                    from
                    to
                  }
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

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  // Resolves a related _response's `current` at the row's own anchor date so
  // past rows show the state the related object had at the time, not today's.
  const resolve = <T extends { validities: any[] } | null | undefined>(
    response: T,
    anchor: string
  ) =>
    response
      ? { ...response, current: findClosestValidity(response.validities, anchor) }
      : response

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
        if (!isOrg && !obj.person_response) return false
        return true
      })
      for (const m of filtered as unknown as EnrichedRow[]) {
        const anchor = lookupDate(m.validity, $date)
        m.person_response = resolve(m.person_response, anchor)
        m.org_unit_response = resolve(m.org_unit_response, anchor)!
        m.manager_level_response = resolve(m.manager_level_response, anchor)
        m.manager_type_response = resolve(m.manager_type_response, anchor)
        m.responsibilities_response.objects = m.responsibilities_response.objects.map(
          (r) => resolve(r, anchor)!
        )
      }
      managers.push(...(filtered as unknown as EnrichedRow[]))
    }
    data = managers
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as manager, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
      leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        {#if isOrg}
          {#if manager.person_response}
            <a href="{base}/employee/{manager.person_response.uuid}">
              {manager.person_response.current?.name ?? manager.person_response.uuid}
            </a>
          {:else}
            {capital($_("vacant"))}
          {/if}
          <!-- Add (*) if manager-object is inherited -->
          {#if manager.org_unit_response?.uuid !== $page.params.uuid}
            <span
              title={capital(
                $_("inherited_manager", {
                  values: {
                    org_unit: manager.org_unit_response?.current?.name,
                  },
                })
              )}>(*)</span
            >
          {/if}
        {:else}
          <a
            href="{base}/organisation/{manager.org_unit_response.uuid}"
            on:click={() => updateGlobalNavigation(manager.org_unit_response.uuid)}
          >
            {manager.org_unit_response.current?.name ?? manager.org_unit_response.uuid}
          </a>
        {/if}
      </td>
      <td class="text-sm p-4">
        <ul>
          {#each manager.responsibilities_response.objects as responsibility}
            <li>
              • {responsibility.current?.name ?? responsibility.uuid}
            </li>
          {/each}
        </ul>
      </td>
      <td class="text-sm p-4"
        >{manager.manager_type_response?.current?.name ??
          manager.manager_type_response?.uuid}</td
      >
      <td class="text-sm p-4"
        >{manager.manager_level_response?.current?.name ??
          manager.manager_level_response?.uuid}</td
      >
      <ValidityTableCell validity={manager.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${manager.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/edit/manager/{manager.uuid}{formatQueryDates(manager.validity)}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
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
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("manager", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
