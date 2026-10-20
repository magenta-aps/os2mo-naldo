<script lang="ts">
  import { Temporal } from "temporal-polyfill"
  import { _ } from "svelte-i18n"
  import { gql } from "graphql-request"
  import SvelteSelect from "svelte-select"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { getManagerRoleTitleAndUuid } from "$lib/utils/display"
  import type { ClassValue } from "$lib/components/forms/entity/types"
  import { ManagerRoleSearchDocument } from "./query.generated"

  // The manager role, not the person: MO links the engagement to the role.
  // Empty leaves the engagement to MO's standard manager.
  export let value: ClassValue | undefined = undefined
  export let at: Temporal.ZonedDateTime | null | undefined
  export let idPrefix = ""

  // MO's filters cannot OR, so the holder's name and the unit's name are two
  // searches. Only the unit search reaches a vacant role.
  gql`
    query ManagerRoleSearch($query: String!, $fromDate: DateTime!) {
      by_person: managers(
        filter: { employee: { query: $query }, from_date: $fromDate }
        limit: 30
      ) {
        objects {
          uuid
          current(at: $fromDate) {
            ...ManagerRoleOption
          }
        }
      }
      by_unit: managers(
        filter: { org_unit: { query: $query }, from_date: $fromDate }
        limit: 30
      ) {
        objects {
          uuid
          current(at: $fromDate) {
            ...ManagerRoleOption
          }
        }
      }
    }

    fragment ManagerRoleOption on Manager {
      person_response {
        current(at: $fromDate) {
          name
        }
      }
      org_unit_response {
        current(at: $fromDate) {
          name
        }
      }
      manager_type_response {
        current(at: $fromDate) {
          name
        }
      }
    }
  `

  // svelte-select sets its own `loading` when a search is aborted.
  let spinner = false
  let abortController: AbortController | undefined

  const searchRoles = async (filterText: string) => {
    if (filterText.length < 3 || !at) return []

    abortController?.abort()
    abortController = new AbortController()
    spinner = true
    try {
      const res = await graphQLClient(abortController.signal).request(
        ManagerRoleSearchDocument,
        { query: filterText, fromDate: at }
      )
      const seen = new Set<string>()
      return [...res.by_person.objects, ...res.by_unit.objects]
        .flatMap((role) => {
          if (!role.current || seen.has(role.uuid)) return []
          seen.add(role.uuid)
          return [getManagerRoleTitleAndUuid({ uuid: role.uuid, ...role.current })]
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    } finally {
      spinner = false
    }
  }

  const floatingConfig = {
    placement: "bottom-start",
    strategy: "fixed",
  }
</script>

<div class="form-control w-full pb-3 text-base-content">
  <label for="{idPrefix}explicit-manager" class="text-sm pb-1">
    {capital($_("explicit_manager"))}
  </label>
  <SvelteSelect
    --font-size="1rem"
    --height="2rem"
    --loading-height="1.5rem"
    --loading-width="1.5rem"
    --spinner-height="1.5rem"
    --spinner-width="1.5rem"
    --item-padding="0.25rem 0.75rem 0.25rem 0.75rem"
    --item-height="auto"
    --item-line-height="auto"
    --clear-select-height="1.5rem"
    --clear-select-width="1.5rem"
    --value-container-padding="0rem"
    --border-radius="0.25rem"
    --padding="0 0.75rem 0 0.75rem"
    id="{idPrefix}explicit-manager-search"
    itemId="uuid"
    loadOptions={searchRoles}
    {floatingConfig}
    disabled={!at}
    loading={spinner}
    bind:value
    hideEmptyState={true}
    placeholder={capital($_("search_for.manager"))}
    clearFilterTextOnBlur={false}
  >
    <div slot="item" let:item>{item.name}</div>
    <div slot="selection" let:selection>{selection.name}</div>
  </SvelteSelect>
  {#if value}
    <input
      hidden
      id="{idPrefix}explicit-manager"
      name="{idPrefix}explicit-manager"
      value={value.uuid}
    />
  {/if}
  <p class="pt-1 text-xs">{capital($_("explicit_manager_hint"))}</p>
</div>
