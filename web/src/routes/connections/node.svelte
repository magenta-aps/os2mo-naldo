<script lang="ts">
  import { _ } from "svelte-i18n"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { onMount } from "svelte"
  import { OrgUnitChildrenDocument, type OrgUnitChildrenQuery } from "./query.generated"
  import Icon from "@iconify/svelte"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"
  import Checkbox from "$lib/components/forms/shared/Checkbox.svelte"
  import RadioButton from "$lib/components/forms/shared/RadioButton.svelte"
  import { checkSDIdentifier } from "$lib/util/helpers"

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
  export let type: "checkbox" | "radio"
  export let breadcrumbs: string[][] = []
  export let selectedOriginOrg: string | null = null
  export let selectedDestinationOrgs: string[] = []
  export let has_children: boolean

  let loading = false

  gql`
    query OrgUnitChildren($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { parent: { uuids: $uuid, from_date: $fromDate }, from_date: $fromDate }) {
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

  const hasMatchingDescendant = (node: Child) => {
    // Checks for children, and if there are children, checks recursively for match.
    if (node.children) {
      for (let child of node.children) {
        if (
          selectedDestinationOrgs.some((uuid) => uuid === child.uuid) ||
          hasMatchingDescendant(child)
        ) {
          return true
        }
      }
    }
    return false
  }

  const expandToDestinationOrgs = async () => {
    let shouldOpen = false

    if (breadcrumbs.length) {
      for (let i = 0; i < breadcrumbs.length; i++) {
        let breadcrumb = breadcrumbs[i]

        if (breadcrumb[0] === uuid) {
          breadcrumbs[i] = breadcrumb.slice(1)
          shouldOpen = true
        }
      }
    }

    if (shouldOpen) await toggleOpen()
  }

  const toggleOpen = async () => {
    if (!open) {
      loading = true

      const res = await fetchChildren(uuid)

      // Overwrite with the new layer of children
      children = res.map((child) => child.validities[0])

      loading = false
    }
    open = !open
  }

  onMount(async () => {
    await expandToDestinationOrgs()
  })
</script>

<li style="padding-left: {indent}px">
  <div class="flex pl-2 text-secondary">
    {#if loading}
      <div class="w-5 h-5 loading loading-spinner" />
    {:else if has_children}
      {#if open}
        <button class="text-secondary" on:click|preventDefault={toggleOpen}>
          <Icon icon={keyboardArrowDownRounded} width="20" height="20" rotate={0} />
        </button>
      {:else}
        <button class="text-secondary" on:click|preventDefault={toggleOpen}>
          <Icon icon={keyboardArrowDownRounded} width="20" height="20" rotate={3} />
        </button>
      {/if}
    {:else}
      <div class="w-5 h-5" />
    {/if}
    {#if type === "radio"}
      <RadioButton
        id={uuid}
        name="origin"
        title={checkSDIdentifier(name, user_key)}
        value={uuid}
        noPadding={true}
      />
    {:else}
      <Checkbox
        id={uuid}
        name="destination"
        title={checkSDIdentifier(name, user_key)}
        value={uuid}
        checked={selectedDestinationOrgs.includes(uuid)}
        disabled={!selectedOriginOrg || selectedOriginOrg === uuid}
        noPadding={true}
      />
    {/if}
  </div>
</li>

{#if open}
  {#each children.sort( (a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1) ) as child}
    <svelte:self
      {...child}
      {selectedDestinationOrgs}
      {selectedOriginOrg}
      {breadcrumbs}
      {type}
      {fromDate}
      indent={indent + 24}
    />
  {/each}
{/if}
