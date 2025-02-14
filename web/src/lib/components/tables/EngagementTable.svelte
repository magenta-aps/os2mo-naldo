<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
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
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { formatQueryDates } from "$lib/util/helpers"
  import { MOConfig } from "$lib/stores/config"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import { env } from "$env/dynamic/public"

  let inheritManager: boolean | undefined

  $: if ($MOConfig) {
    if ($MOConfig.confdb_inherit_manager === "false") {
      inheritManager = false
    }
  }

  type Engagements = EngagementsQuery["engagements"]["objects"][0]["validities"]
  let data: Engagements

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  // Use deprecated filter, because `employee`/`org_unit` filters will query for every object, if uuid is set to null
  // TODO: When https://redmine.magenta.dk/issues/62968 is fixed, add date-filters to classes
  gql`
    query Engagements(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $inherit: Boolean = true
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
          validities {
            uuid
            user_key
            person(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              name
            }
            job_function {
              name
            }
            extension_1
            engagement_type {
              name
            }
            org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
            }
            managers(inherit: $inherit, exclude_self: true) {
              person {
                name
                uuid
              }
              org_unit {
                name
              }
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
      inherit: inheritManager,
      ...tenseToValidity(tense, $date),
    })
    const engagements: Engagements = []

    // Filters and flattens the data
    for (const outer of res.engagements.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      engagements.push(...filtered)
    }
    data = engagements
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as engagement, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
      py-4 leading-5 border-t border-slate-300 text-secondary"
    >
      <td class="text-sm p-4">
        {#if isOrg}
          <a href="{base}/employee/{engagement.person[0].uuid}"
            >{engagement.person[0].name}</a
          >
        {:else}
          <a
            href="{base}/organisation/{engagement.org_unit[0].uuid}"
            on:click={() => updateGlobalNavigation(engagement.org_unit[0].uuid)}
            >{engagement.org_unit[0].name}</a
          >
        {/if}
      </td>
      <td class="text-sm p-4">{engagement.user_key}</td>
      <td class="text-sm p-4">{engagement.job_function.name}</td>
      {#if env.PUBLIC_SHOW_EXTENSION_1 === "true"}
        <td class="text-sm p-4"
          >{engagement.extension_1 ? engagement.extension_1 : ""}</td
        >
      {/if}
      <td class="text-sm p-4">{engagement.engagement_type.name}</td>
      {#if !isOrg}
        <td class="text-sm p-4">
          <!-- If there's more than 1 manager, create a list -->
          <!-- Extra if/else logic implemented, so we can add <a>-tags to the managers -->
          {#if engagement.managers.length > 1}
            <ul>
              {#each engagement.managers as manager}
                <li>
                  {#if manager.person}
                    <a href="{base}/employee/{manager.person?.[0].uuid}">
                      • {manager.person?.[0].name}
                    </a>
                  {:else}
                    • {capital($_("vacant"))}
                  {/if}
                </li>
              {/each}
            </ul>
            <!-- If there's only 1 manager and it's not vacant -->
          {:else if engagement.managers[0] && engagement.managers[0].person?.[0]}
            <a href="{base}/employee/{engagement.managers[0].person[0].uuid}">
              {engagement.managers[0].person[0].name}
            </a>
            <!-- 1 vacant manager -->
            <!-- TODO: probably implement vacant manager filter when done? -->
            <!-- https://git.magenta.dk/rammearkitektur/os2mo/-/merge_requests/2555 -->
          {:else if engagement.managers[0]}
            {capital($_("vacant"))}
          {:else}
            {capital(
              $_("no_item", { values: { item: $_("manager", { values: { n: 1 } }) } })
            )}
          {/if}
        </td>
      {/if}
      {#if $MOConfig && $MOConfig.confdb_show_primary_engagement === "true"}
        <td class="text-sm p-4">{engagement.primary ? engagement.primary.name : ""}</td>
      {/if}
      <ValidityTableCell validity={engagement.validity} />
      {#if env.PUBLIC_AUDITLOG === "true"}
        <td>
          <a href={`${base}/auditlog/${engagement.uuid}`}>
            <Icon icon={historyRounded} width="25" height="25" />
          </a>
        </td>
      {/if}
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/edit/engagement/{engagement.uuid}{formatQueryDates(
            engagement.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/terminate/engagement/{engagement.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("engagement", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
