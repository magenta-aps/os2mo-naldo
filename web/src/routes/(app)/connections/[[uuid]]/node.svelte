<script lang="ts">
  import { _ } from "svelte-i18n"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { OrgUnitChildrenDocument, type OrgUnitChildrenQuery } from "./query.generated"
  import Icon from "@iconify/svelte"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"
  import Checkbox from "$lib/components/forms/shared/Checkbox.svelte"
  import { checkSDIdentifier } from "$lib/utils/helpers"

  type Child = {
    uuid: string
    name: string
    children?: { uuid: string; name: string }[]
  }

  export let name = ""
  export let user_key = ""
  export let children: Child[] = []
  export let indent = 0
  export let uuid = ""
  export let open = false
  export let fromDate: string
  export let openSet: Set<string> = new Set()
  export let selectedOriginOrg: string | null = null
  export let selectedDestinationOrgs: string[] = []
  export let onToggleDestination: (uuid: string) => void
  export let has_children: boolean

  let loading = false

  gql`
    query OrgUnitChildren($uuid: [UUID!], $fromDate: DateTime) {
      org_units(
        filter: { parent: { uuids: $uuid, from_date: $fromDate }, from_date: $fromDate }
      ) {
        objects {
          validities {
            name
            user_key
            uuid
            has_children(filter: { from_date: $fromDate })
          }
        }
      }
    }
  `

  const fetchChildren = async (uuid: string) => {
    const res = await graphQLClient().request(OrgUnitChildrenDocument, {
      uuid: uuid,
      fromDate: fromDate,
    })

    return res.org_units.objects
  }

  // Auto-open this node whenever a fresh `openSet` says so (e.g. a new origin
  // brings a new set of ancestors-to-expand). Compared against `appliedOpenSet`
  // so user-driven manual toggles aren't undone on every reactive tick.
  let appliedOpenSet: Set<string> | undefined
  $: if (openSet !== appliedOpenSet) {
    appliedOpenSet = openSet
    if (openSet.has(uuid) && !open && !loading) toggleOpen()
  }

  const toggleOpen = async () => {
    if (open) {
      open = false
      return
    }
    // Bail if a load is already running. Without this, two concurrent calls
    // (e.g. the reactive firing for the prefill chain and again for the
    // origin update) would each `open = !open` at the end and cancel out,
    // leaving `open === false` and collapsing the node.
    if (loading) return
    loading = true
    try {
      const res = await fetchChildren(uuid)
      // Sort once on assignment (not per render in the template), using
      // localeCompare so Danish å/æ/ø match the root list's ordering.
      children = res
        .map((child) => child.validities[0])
        .sort((a, b) => a.name.localeCompare(b.name))
      open = true
    } finally {
      // Always clear the spinner, even if the fetch rejects, so the node can be
      // retried instead of getting stuck on a permanent spinner.
      loading = false
    }
  }
</script>

<li style="padding-left: {indent}px">
  <div class="flex pl-2 text-base-content">
    {#if loading}
      <div class="w-5 h-5 loading loading-spinner" />
    {:else if has_children}
      {#if open}
        <button class="text-base-content" on:click|preventDefault={toggleOpen}>
          <Icon icon={keyboardArrowDownRounded} width="20" height="20" rotate={0} />
        </button>
      {:else}
        <button class="text-base-content" on:click|preventDefault={toggleOpen}>
          <Icon icon={keyboardArrowDownRounded} width="20" height="20" rotate={3} />
        </button>
      {/if}
    {:else}
      <div class="w-5 h-5" />
    {/if}
    <Checkbox
      id={uuid}
      title={checkSDIdentifier(name, user_key)}
      value={uuid}
      checked={selectedDestinationOrgs.includes(uuid)}
      on:change={() => onToggleDestination(uuid)}
      disabled={!selectedOriginOrg || selectedOriginOrg === uuid}
      noPadding={true}
    />
  </div>
</li>

{#if open}
  {#each children as child}
    <svelte:self
      {...child}
      {selectedDestinationOrgs}
      {selectedOriginOrg}
      {onToggleDestination}
      {openSet}
      {fromDate}
      indent={indent + 24}
    />
  {/each}
{/if}
