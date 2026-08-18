<script lang="ts">
  import { _, locale } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { tenseToValidity, tenseFilter } from "$lib/utils/tenses"
  import { formatQueryDates } from "$lib/utils/validities"
  import { date } from "$lib/stores/date"
  import { RoleDocument, type RoleQuery } from "./query.generated"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { groupRolesByITSystem } from "$lib/utils/roles"
  import { foldedITSystems } from "$lib/stores/roleFolding"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"

  type Roles = RoleQuery["classes"]["objects"][0]["validities"]

  export let tense: Tense
  export let itSystemUuid: string | undefined = undefined

  gql`
    query Role($itSystem: ITSystemFilter, $fromDate: DateTime, $toDate: DateTime) {
      classes(
        filter: {
          facet: { user_keys: ["role"] }
          it_system: $itSystem
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          validities {
            name
            user_key
            uuid
            it_system_response {
              uuid
              current(at: $fromDate) {
                name
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
    .request(RoleDocument, {
      ...(itSystemUuid && { itSystem: { uuids: [itSystemUuid] } }),
      ...tenseToValidity(tense, $date),
    })
    .then((res) => {
      const roles: Roles = []

      // Filters and flattens the data
      for (const outer of res.classes.objects) {
        // TODO: Remove when GraphQL is able to do this for us
        const filtered = outer.validities.filter((obj) => {
          return tenseFilter(obj, tense)
        })
        roles.push(...filtered)
      }
      return roles
    })
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  {#each groupRolesByITSystem(data, $locale ?? "da") as group}
    {@const foldKey = group.itSystem?.uuid ?? null}
    {@const folded = $foldedITSystems.has(foldKey)}
    <tr class="border-t border-base-300">
      <th class="px-4 py-2 text-left font-semibold text-base-content" colSpan={15}>
        <button
          type="button"
          class="flex items-center gap-1"
          aria-expanded={!folded}
          on:click={() => foldedITSystems.toggle(foldKey)}
        >
          <Icon
            icon={keyboardArrowDownRounded}
            width="20"
            height="20"
            rotate={folded ? 3 : 0}
          />
          {group.itSystem
            ? group.itSystem.name
            : capital(
                $_("no_item", {
                  values: { item: $_("itsystem", { values: { n: 1 } }) },
                })
              )}
          <span class="font-normal text-base-content/70">({group.roles.length})</span>
        </button>
      </th>
    </tr>
    {#if !folded}
      {#each sortData(group.roles, $sortKey, $sortDirection) as role, i}
        <tr
          class="{i % 2 === 0 ? '' : 'bg-base-200'}
            leading-5 border-t border-base-300 text-base-content"
        >
          <td class="text-sm p-4">{role.name}</td>
          <td class="text-sm p-4">{role.user_key}</td>
          <ValidityTableCell validity={role.validity} />
          <td class="flex p-4 gap-2 justify-end">
            <a href={`${base}/auditlog/${role.uuid}`}>
              <Icon icon={historyRounded} width="25" height="25" />
            </a>
            <a
              href="{base}/admin/role/{role.uuid}/edit{formatQueryDates(role.validity)}"
            >
              <Icon icon={editSquareOutlineRounded} width="25" height="25" />
            </a>
            {#if env.PUBLIC_ENABLE_CLASS_TERMINATION}
              <a href="{base}/admin/role/{role.uuid}/terminate">
                <Icon icon={cancelOutlineRounded} width="25" height="25" />
              </a>
            {/if}
          </td>
        </tr>
      {/each}
    {/if}
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("role", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{:catch}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("load_error"))}</td>
  </tr>
{/await}
