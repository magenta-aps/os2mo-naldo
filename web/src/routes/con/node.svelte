<script lang="ts">
  import { _ } from "svelte-i18n"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { createEventDispatcher } from "svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { onMount } from "svelte"
  import { OrgUnitChildrenDocument, type OrgUnitChildrenQuery } from "./query.generated"
  import Icon from "@iconify/svelte"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import RadioButton from "$lib/components/forms/shared/radio_button.svelte"

  export let name = ""
  export let children: any[] = []
  export let indent = 8
  export let uuid = ""
  export let open = false
  export let fromDate: string
  export let type: "checkbox" | "radio"
  export let selectedOriginOrg: string | null = null
  export let selectedDestinationOrgs: string[] = []
  export let parentUuid: string = ""

  let loading = false
  const dispatch = createEventDispatcher()

  gql`
    query OrgUnitChildren($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { parents: $uuid, from_date: $fromDate }) {
        objects {
          validities {
            name
            uuid
            children(limit: 1) {
              uuid
            }
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

  // Fatter minus
  const openParentNodes = (currentUuid: string) => {
    // Opens parent nodes if they have matching children
    if (hasMatchingDescendant({ uuid, children })) {
      console.log("match")

      open = true
    }
    if (parentUuid !== "") {
      dispatch("openSelf", { parentUuid: parentUuid, currentUuid: currentUuid })
    }
  }

  // Vi skal hente alle children til en enhed - jeg tror det ikke virker pga. limit 1?
  const hasMatchingDescendant = (node: any) => {
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

  const toggleOpen = async () => {
    if (!open) {
      loading = true

      // Check if we already did this (re-opening the org)
      if (!children.some((child) => "children" in child)) {
        const res = await fetchChildren(uuid)

        // Overwrite with the new layer of children
        children = res.map((child) => child.validities[0])
      }

      loading = false
    }
    open = !open
  }

  $: if (selectedDestinationOrgs && type === "checkbox") {
    console.log(selectedDestinationOrgs)

    selectedDestinationOrgs.forEach((uuid) => {
      openParentNodes(uuid)
    })
  }
</script>

<li style="padding-left: {indent}px">
  <div class="flex items-center">
    {#if loading}
      <div class="loading loading-spinner h-5 w-5" />
    {:else if children.length}
      {#if open}
        <button on:click|preventDefault={toggleOpen}>
          <Icon icon={keyboardArrowDownRounded} width="20" height="20" rotate={0} />
        </button>
      {:else}
        <button on:click|preventDefault={toggleOpen}>
          <Icon icon={keyboardArrowDownRounded} width="20" height="20" rotate={3} />
        </button>
      {/if}
    {:else}
      <div class="h-5 w-5" />
    {/if}
    {#if type === "radio"}
      <RadioButton id={uuid} name="origin" title={name} value={uuid} noPadding={true} />
    {:else}
      <Checkbox
        id={uuid}
        name="destination"
        title={name}
        value={uuid}
        noPadding={true}
      />
    {/if}
  </div>
</li>

{#if open}
  {#each children.sort( (a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1) ) as child}
    <svelte:self
      {...child}
      parentUuid={uuid}
      {type}
      {fromDate}
      indent={indent + 24}
      on:openSelf={(e) => {
        open = true
        e.stopPropagation()
      }}
      on:requestParentOpen={(e) => {
        // ??? Gør det her overhovedet noget
        if (e.detail.parentUuid === uuid) {
          open = true
          if (parentUuid !== "") {
            dispatch("requestParentOpen", { parentUuid: parentUuid, currentUuid: uuid })
          }
        }
      }}
    />
  {/each}
{/if}
