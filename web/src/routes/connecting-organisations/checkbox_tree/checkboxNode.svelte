<script lang="ts">
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { createEventDispatcher, onMount } from "svelte"
  import {
    selectedDestinationUuids,
    selectedOriginUuid,
  } from "$lib/stores/selectedItem"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import RadioButton from "$lib/components/forms/shared/radioButton.svelte"
  import Arrow from "$lib/components/forms/shared/arrow.svelte"
  import { RelatedeUnitsChildrenDocument } from "./query.generated"

  export let name = ""
  export let children: any[] = []
  export let indent = 0
  export let uuid = ""
  export let fromDate: string
  export let allowMultipleSelection: boolean = false
  export let parentUuid: string = ""

  let loading = false
  let isOpen = false
  let prevSelectedOriginUuid: string = ""

  const dispatch = createEventDispatcher()

  gql`
    query RelatedeUnitsChildren($uuid: [UUID!], $fromDate: DateTime) {
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
    const res = await graphQLClient().request(RelatedeUnitsChildrenDocument, {
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

  const toggleOpen = async () => {
    if (!isOpen) {
      loading = true
      for (let child of children) {
        if (!child.children) {
          child.children = await fetchChildren(child.uuid)
        }
      }
      loading = false
    }
    isOpen = !isOpen

    // Check if the selected node is still visible after the toggle
    if (
      !allowMultipleSelection &&
      $selectedOriginUuid &&
      !isUuidVisible({ children, isOpen, uuid: parentUuid }, $selectedOriginUuid.uuid)
    ) {
      selectedOriginUuid.set(null)
      selectedDestinationUuids.set([])
    }
  }

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement
    const isChecked = target.checked
    const uuid = target.id

    if (target.type === "radio") {
      handleRadioChange(isChecked, uuid)
    } else if (target.type === "checkbox") {
      handleCheckboxChange(isChecked, uuid)
    }
  }

  function handleRadioChange(isChecked: boolean, uuid: string) {
    if (isChecked) {
      selectedOriginUuid.set({ uuid, name })
    } else {
      selectedOriginUuid.set(null)
    }
    dispatch("radioChanged", { isChecked, uuid })
  }

  function handleCheckboxChange(isChecked: boolean, uuid: string) {
    selectedDestinationUuids.update((currentDestinations) => {
      if (isChecked) {
        return [...currentDestinations, { uuid, name }]
      } else {
        return currentDestinations.filter((org) => org.uuid !== uuid)
      }
    })
    dispatch("checkboxChanged", { isChecked, uuid })
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
          $selectedDestinationUuids.some((dest) => dest.uuid === child.uuid) ||
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

  onMount(async () => {
    await fetchAndSetChildren()
  })

  /*  $: {
  if ($selectedOriginUuid === null && allowMultipleSelection) {
    isOpen = false;
  }

  if ($selectedOriginUuid && allowMultipleSelection) {
    // Luk alle noder
    isOpen = false;

    $selectedDestinationUuids.forEach((destination) => {
      if (
        destination.uuid === uuid ||
        children.some((child) => child.uuid === destination.uuid)
      ) {
        openParentNodes(destination.uuid);
      }
      // Tjek for at åbne rodnoden
      if (
        parentUuid === "" &&
        children.some((child) => child.uuid === destination.uuid)
      ) {
        isOpen = true;
      }
    });
  }
} */

  $: {
    if ($selectedOriginUuid === null && allowMultipleSelection) {
      isOpen = false
    }

    if (
      $selectedOriginUuid &&
      $selectedOriginUuid.uuid !== prevSelectedOriginUuid &&
      allowMultipleSelection
    ) {
      isOpen = false

      $selectedDestinationUuids.forEach((destination) => {
        if (
          destination.uuid === uuid ||
          children.some((child) => child.uuid === destination.uuid)
        ) {
          openParentNodes(destination.uuid)
        }
        // Tjek for at åbne rodnoden
        if (
          parentUuid === "" &&
          children.some((child) => child.uuid === destination.uuid)
        ) {
          isOpen = true
        }
      })

      prevSelectedOriginUuid = $selectedOriginUuid.uuid
    }
  }

  $: sortedChildren = children.slice().sort((a, b) => a.name.localeCompare(b.name))

  $: isSelectedOrigin = $selectedOriginUuid && $selectedOriginUuid.uuid === uuid
  $: isSelectedDestination = $selectedDestinationUuids.some((obj) => obj.uuid === uuid)
</script>

<!-- TODO: fjern A11y ignore når checkboxer fungere som det skal, er pt tilføjet for ikke at have gule linjer over alt i koden -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->

<!-- TODO: Der skal muligvis indføres en animate-spin mens der bliver læst ind så man kan se at derforegår noget, men hvor vil det give mening?-->

<li style="padding-left: {indent}px">
  <div class="flex items-center">
    {#if loading}
      <div class="animate-spin rounded-full h-5 w-5 border-b-4 border-primary" />
    {:else}
      <!-- {uuid} (Parent UUID: {parentUuid})  -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- Placeholder for arrows even if no children are present, gives a better visuel experience -->
      <div
        class="flex items-center justify-center w-5 h-5 mr-2 mb-3"
        on:click={toggleOpen}
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
          disabled={!$selectedOriginUuid ||
            ($selectedOriginUuid && $selectedOriginUuid.uuid === uuid)}
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
