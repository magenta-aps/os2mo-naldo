<script lang="ts">
  import { Temporal } from "temporal-polyfill"
  import { _ } from "svelte-i18n"
  import { gql } from "graphql-request"
  import { capital, formatManagerTitleAndUuid } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { createQuery } from "$lib/http/query"
  import { findClosestValidity, findValidityAt } from "$lib/utils/validities"
  import Search from "$lib/components/search/Search.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import type { ClassValue } from "$lib/components/forms/entity/types"
  import { PersonManagersDocument } from "./query.generated"

  // The manager role, not the person: MO links the engagement to the role.
  // Empty leaves the engagement to MO's standard manager.
  export let value: ClassValue | undefined = undefined
  // Bound too, so a remounted wizard tab keeps the person its role belongs to.
  export let person: { uuid: string; name: string } | undefined = undefined
  export let at: Temporal.ZonedDateTime | null | undefined
  export let idPrefix = ""
  // The engagement's stored link, as the edit forms load it. Seeds the fields,
  // and is posted back so the action only sends an explicit manager the user
  // changed.
  export let link:
    | {
        uuid: string
        validities: {
          person_response?: { uuid: string; current?: { name: string } | null } | null
          org_unit_response?: { current?: { name: string } | null }
          manager_type_response?: { current?: { name: string } | null } | null
          validity: {
            from?: Temporal.ZonedDateTime | null
            to?: Temporal.ZonedDateTime | null
          }
        }[]
      }
    | null
    | undefined = undefined

  gql`
    query PersonManagers($person: [UUID!], $fromDate: DateTime!) {
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

  // Named by the validity closest to the start date, also when the role is not
  // active then, so an outdated link can still be cleared.
  const linkedValidity = link ? findClosestValidity(link.validities, at) : null
  const linked: ClassValue | undefined = link
    ? linkedValidity
      ? formatManagerTitleAndUuid({ ...linkedValidity, uuid: link.uuid })
      : { uuid: link.uuid, name: link.uuid }
    : undefined
  if (linked && !value) {
    value = linked
    const holder = linkedValidity?.person_response
    person = holder
      ? { uuid: holder.uuid, name: holder.current?.name ?? holder.uuid }
      : undefined
  }
  // MO neither ends nor validates the link when its role ends, so the form can
  // load one that is not active on the start date. It is shown, can be
  // cleared, and is flagged below while it is the chosen role.
  $: linkActive = !!link && !!findValidityAt(link.validities, at)

  $: personUuid = person?.uuid
  // The person search clears itself without an event when the date moves to
  // where the person does not exist, so the role goes here. The stored link
  // stays: a vacant or outdated one has no person to begin with.
  $: if (!personUuid && value && value.uuid !== linked?.uuid) value = undefined

  // Picking another person clears the role (on:change below): a failed fetch
  // keeps the previous person's managers as data, so the list cannot be relied on
  // to drop it. Without a person the list stays unloaded instead of empty, so a
  // prefilled vacant role survives.
  const managers = createQuery<ClassValue[]>()
  $: if (personUuid && at) {
    const uuid = personUuid
    const fromDate = at
    managers.run(async (signal) => {
      const res = await graphQLClient(signal).request(PersonManagersDocument, {
        person: [uuid],
        fromDate,
      })
      return res.managers.objects.flatMap((manager) =>
        manager.current
          ? [formatManagerTitleAndUuid({ uuid: manager.uuid, ...manager.current })]
          : []
      )
    })
  }

  // The stored role stays an option while it is the chosen one, so a list
  // loaded for another date cannot drop it; only the user replaces or clears it.
  $: keepLinked =
    !!linked &&
    value?.uuid === linked.uuid &&
    !$managers.data?.some((manager) => manager.uuid === linked?.uuid)
  $: options =
    personUuid && !$managers.loading && $managers.data
      ? keepLinked && linked
        ? [...$managers.data, linked]
        : $managers.data
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
  disabled={(!personUuid && !value) || !at || $managers.error}
  isClearable={true}
/>
{#if $managers.error}
  <p class="text-sm text-error">{capital($_("load_error_options"))}</p>
{/if}
{#if link}
  <input hidden name="{idPrefix}explicit-manager-initial" value={link.uuid} />
{/if}
{#if linked && value?.uuid === linked.uuid && !linkActive}
  <div class="alert alert-warning rounded-sm mb-3 text-sm">
    <span>{capital($_("explicit_manager_ended"))}</span>
  </div>
{/if}
