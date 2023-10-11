<script lang="ts">
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { createEventDispatcher, onMount } from "svelte"
  import { selectedDestinationsOrgs, selectedOriginOrg } from "$lib/stores/selectedOrg"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import RadioButton from "$lib/components/forms/shared/radioButton.svelte"
  import Arrow from "$lib/components/forms/shared/arrow.svelte"
  import { RelatedUnitsChildrenDocument } from "./query.generated"

  export let name = ""
  export let children: any[] = []
  export let indent = 0
  export let uuid = ""
  export let fromDate: string
  export let allowMultipleSelection: boolean = false
  export let parentUuid: string = ""

  let loading = false
  let isOpen = false

  const dispatch = createEventDispatcher()

  gql`
    query RelatedUnitsChildren($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            children {
              name
              uuid
              children {
                name
                uuid
              }
            }
          }
        }
      }
    }
  `

  const fetchChildren = async (uuid: string) => {
    const res = await graphQLClient().request(RelatedUnitsChildrenDocument, {
      uuid: uuid,
      fromDate: fromDate,
    })
    const children = res.org_units?.objects[0].objects[0].children
    return children.sort((a, b) => a.name.localeCompare(b.name))
  }

  const fetchAndSetChildren = async () => {
    const fetchPromises = []

    for (let child of children) {
      if (!child.children) {
        fetchPromises.push(
          fetchChildren(child.uuid).then((fetchedChildren) => {
            child.children = fetchedChildren
          })
        )
      }
    }
    await Promise.all(fetchPromises)
  }

  const openNode = async () => {
    if (!isOpen) {
      loading = true
      await fetchAndSetChildren()
      loading = false
      isOpen = true
    }
  }

  const closeNode = () => {
    if (!isOpen) return
    if (isOpen) {
      if (
        !allowMultipleSelection &&
        $selectedOriginOrg &&
        !isUuidVisible(
          { children, isOpen: false, uuid: parentUuid },
          $selectedOriginOrg.uuid
        )
      ) {
        selectedOriginOrg.set(null)
        selectedDestinationsOrgs.set([])
      }
      isOpen = false
    }
  }

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement
    const isChecked = target.checked
    const uuid = target.id

    if (target.type === "radio") {
      selectedOriginOrg.set(isChecked ? { uuid, name } : null)
      dispatch("radioChanged", { isChecked, uuid })
    } else if (target.type === "checkbox") {
      selectedDestinationsOrgs.update((currentDestinations) => {
        return isChecked
          ? [...currentDestinations, { uuid, name }]
          : currentDestinations.filter((org) => org.uuid !== uuid)
      })
      dispatch("checkboxChanged", { isChecked, uuid })
    }
  }

  function openParentNodes(currentUuid: string): void {
    if (hasMatchingDescendant({ uuid, children })) {
      isOpen = true

      if (parentUuid !== "") {
        dispatch("openParent", { uuid: parentUuid })
      }
    }
  }

  function hasMatchingDescendant(node: any): boolean {
    // Tjekker for børn, og hvis der er børn, tjekker rekursivt
    if (node.children) {
      for (let child of node.children) {
        if (
          $selectedDestinationsOrgs.some((dest) => dest.uuid === child.uuid) ||
          hasMatchingDescendant(child)
        ) {
          return true
        }
      }
    }
    return false
  }

  function isUuidVisible(node: any, uuidToCheck: string): boolean {
    if (node.uuid === uuidToCheck && node.isOpen) return true

    if (node.children) {
      for (let child of node.children) {
        if (isUuidVisible(child, uuidToCheck)) {
          return true
        }
      }
    }

    return false
  }

  $: if ($selectedOriginOrg && allowMultipleSelection) {
    isOpen = false

    $selectedDestinationsOrgs.forEach((destination) => {
      if (
        destination.uuid === uuid ||
        children.some((child) => child.uuid === destination.uuid)
      ) {
        openParentNodes(destination.uuid)
      }

      if (
        parentUuid === "" &&
        children.some((child) => child.uuid === destination.uuid)
      ) {
        isOpen = true
      }
    })
  }

  $: if ($selectedOriginOrg === null && allowMultipleSelection) {
    isOpen = false
  }

  $: isSelectedOrigin = $selectedOriginOrg && $selectedOriginOrg.uuid === uuid
  $: isSelectedDestination = $selectedDestinationsOrgs.some((obj) => obj.uuid === uuid)

  $: sortedChildren = children.slice().sort((a, b) => a.name.localeCompare(b.name))

  onMount(async () => {
    await fetchAndSetChildren()
  })
</script>

<li style="padding-left: {indent}px">
  <div class="flex items-center">
    {#if loading}
      <div class="animate-spin rounded-full h-5 w-5 border-b-4 border-primary" />
    {:else}
      <div
        class="flex items-center justify-center w-5 h-5 mr-2 mb-3"
        on:click={isOpen ? closeNode : openNode}
      >
        {#if children && children.length > 0}
          {#if isOpen}
            <Arrow class="transform rotate-90" />
          {:else}
            <Arrow />
          {/if}
        {/if}
      </div>
    {/if}
    {#if allowMultipleSelection}
      <div on:change={handleInputChange} class="ml-2">
        <Checkbox
          id={uuid}
          title={name}
          value="checked"
          startValue={isSelectedDestination ? "checked" : "unchecked"}
          disabled={!$selectedOriginOrg ||
            ($selectedOriginOrg && $selectedOriginOrg.uuid === uuid)}
        />
      </div>
    {:else}
      <div on:change={handleInputChange} class="ml-2">
        <RadioButton
          groupName="originUuid"
          id={uuid}
          title={name}
          value={isSelectedOrigin ? "checked" : "unchecked"}
        />
      </div>
    {/if}
  </div>
</li>

{#if isOpen}
  {#each sortedChildren as child}
    <svelte:self
      {...child}
      indent={indent + 30}
      {fromDate}
      {allowMultipleSelection}
      parentUuid={uuid}
      on:openParent={(e) => {
        if (e.detail.uuid === uuid) {
          isOpen = true
          e.stopPropagation()
        }
      }}
    />
  {/each}
{/if}
