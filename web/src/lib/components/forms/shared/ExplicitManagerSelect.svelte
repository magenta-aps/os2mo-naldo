<script lang="ts">
  import { Temporal } from "temporal-polyfill"
  import { _ } from "svelte-i18n"
  import { gql } from "graphql-request"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { createQuery } from "$lib/http/query"
  import { getManagerRoleTitleAndUuid } from "$lib/utils/display"
  import Search from "$lib/components/search/Search.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import type { ClassValue } from "$lib/components/forms/entity/types"
  import { ManagerRolesDocument } from "./query.generated"

  // The manager role, not the person: MO links the engagement to the role.
  // Empty leaves the engagement to MO's standard manager.
  export let value: ClassValue | undefined = undefined
  // Bound too, so a remounted wizard tab keeps the person its role belongs to.
  export let person: { uuid: string; name: string } | undefined = undefined
  export let at: Temporal.ZonedDateTime | null | undefined
  export let idPrefix = ""
  // The engagement's stored role. Offered while it is still the chosen one, so
  // a list loaded for another date cannot drop it; only the user replaces or
  // clears it.
  export let linked: ClassValue | undefined = undefined

  gql`
    query ManagerRoles($person: [UUID!], $fromDate: DateTime!) {
      managers(filter: { employee: { uuids: $person }, from_date: $fromDate }) {
        objects {
          uuid
          current(at: $fromDate) {
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
        }
      }
    }
  `

  $: personUuid = person?.uuid
  // The person search clears itself without an event when the date moves to
  // where the person does not exist, so the role goes here. The stored link
  // stays: a vacant or outdated one has no person to begin with.
  $: if (!personUuid && value && value.uuid !== linked?.uuid) value = undefined

  // Picking another person clears the role (on:change below): a failed fetch
  // keeps the previous person's roles as data, so the list cannot be relied on
  // to drop it. Without a person the list stays unloaded instead of empty, so a
  // prefilled vacant role survives.
  const roles = createQuery<ClassValue[]>()
  $: if (personUuid && at) {
    const uuid = personUuid
    const fromDate = at
    roles.run(async (signal) => {
      const res = await graphQLClient(signal).request(ManagerRolesDocument, {
        person: [uuid],
        fromDate,
      })
      return res.managers.objects.flatMap((role) =>
        role.current
          ? [getManagerRoleTitleAndUuid({ uuid: role.uuid, ...role.current })]
          : []
      )
    })
  }

  $: keepLinked =
    !!linked &&
    value?.uuid === linked.uuid &&
    !$roles.data?.some((role) => role.uuid === linked?.uuid)
  $: options =
    personUuid && !$roles.loading && $roles.data
      ? keepLinked && linked
        ? [...$roles.data, linked]
        : $roles.data
      : undefined
</script>

<Search
  type="employee"
  title={capital($_("explicit_manager"))}
  info={capital($_("explicit_manager_hint"))}
  id="{idPrefix}explicit-manager-person"
  {at}
  bind:value={person}
  on:change={() => (value = undefined)}
  on:clear={() => (value = undefined)}
/>
<Select
  title={capital($_("manager_role"))}
  id="{idPrefix}explicit-manager"
  bind:value
  iterable={options}
  disabled={(!personUuid && !value) || !at || $roles.error}
  isClearable={true}
/>
{#if $roles.error}
  <p class="text-sm text-error">{capital($_("load_error_options"))}</p>
{/if}
