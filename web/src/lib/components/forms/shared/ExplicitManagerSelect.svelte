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

  // A changed person's list drops the chosen role. Without a person the list
  // stays unloaded instead of empty, so a prefilled vacant role survives.
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
</script>

<div class="flex flex-row gap-6">
  <Search
    type="employee"
    title={capital($_("explicit_manager"))}
    info={capital($_("explicit_manager_hint"))}
    id="{idPrefix}explicit-manager-person"
    {at}
    bind:value={person}
    on:clear={() => (value = undefined)}
    extra_classes="basis-1/2"
  />
  <Select
    title={capital($_("manager_role"))}
    id="{idPrefix}explicit-manager"
    bind:value
    iterable={personUuid && !$roles.loading ? $roles.data : undefined}
    disabled={(!personUuid && !value) || !at || $roles.error}
    isClearable={true}
    extra_classes="basis-1/2"
  />
</div>
{#if $roles.error}
  <p class="text-sm text-error">{capital($_("load_error_options"))}</p>
{/if}
