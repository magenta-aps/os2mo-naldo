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
  import { OrgUnitChildrenCheckboxDocument } from "./query.generated"

  /* export let selectedOrg: any */
  export let name = ""
  export let children: any[] = []
  export let indent = 0
  export let uuid = ""
  export let fromDate: string
  export let allowMultipleSelection: boolean = false

  let loading = false

  let isLoading = false

  const dispatch = createEventDispatcher()

  export let parentUuid: string = ""
  let isOpen = false

  gql`
    query OrgUnitChildrenCheckbox($uuid: [UUID!], $fromDate: DateTime) {
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
    const res = await graphQLClient().request(OrgUnitChildrenCheckboxDocument, {
      uuid: uuid,
      fromDate: fromDate,
    })
    const children = res.org_units?.objects[0].objects[0].children
    return children.sort((a, b) => a.name.localeCompare(b.name))
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

  $: if ($selectedOriginUuid === null && allowMultipleSelection) {
    isOpen = false
  }

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement
    const isChecked = target.checked
    const uuid = target.id

    if (target.type === "radio") {
      if (isChecked) {
        selectedOriginUuid.set({ uuid, name })
      } else {
        selectedOriginUuid.set(null)
      }
      dispatch("radioChanged", { isChecked, uuid })
    } else if (target.type === "checkbox") {
      if (isChecked) {
        selectedDestinationUuids.update((currentDestinations) => {
          return [...currentDestinations, { uuid, name }]
        })
      } else {
        selectedDestinationUuids.update((currentDestinations) => {
          return currentDestinations.filter((org) => org.uuid !== uuid)
        })
      }
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
          $selectedDestinationUuids.some((dest) => dest.uuid === child.uuid) ||
          hasMatchingDescendant(child)
        ) {
          return true
        }
      }
    }

    // Hvis ingen match findes, returner false
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

  $: if ($selectedOriginUuid) {
    if (allowMultipleSelection) {
      // Luk alle noder
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
    }
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

  $: sortedChildren = children.slice().sort((a, b) => a.name.localeCompare(b.name))

  onMount(async () => {
    await fetchAndSetChildren()
  })

  //todo: mere sigende navne?
  $: isOriginSelected = $selectedOriginUuid && $selectedOriginUuid.uuid === uuid
  $: isDestinationSelected = $selectedDestinationUuids.some((obj) => obj.uuid === uuid)
</script>

<!-- TODO: fjern A11y ignore når checkboxer fungere som det skal, er pt tilføjet for ikke at have gule linjer over alt i koden -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->

<!-- TODO: Der skal muligvis indføres en animate-spin mens der bliver læst ind så man kan se at derforegår noget, men hvor vil det give mening?-->
<!-- <li
  style="padding-left: {indent}px"
  on:click={() => {
    selectedOrg.name = name
    selectedOrg.uuid = uuid
  }}
> -->
<li style="padding-left: {indent}px">
  <div class="flex items-center">
    <!-- Indlæsningsindikator -->
    {#if loading}
      <div class="animate-spin rounded-full h-5 w-5 border-b-4 border-primary" />
    {:else}
      <!-- {uuid} (Parent UUID: {parentUuid}) -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- Placeholder for arrows even if no children are present, gives a better visuel experience -->
      <!--       <div
        class="flex items-center justify-center w-5 h-5 mr-2 mb-3"
        on:click={isLoading
          ? undefined
          : (event) => {
              toggleOpen()
              event.stopPropagation()
            }}
      > -->

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
          startValue={isDestinationSelected ? "checked" : "unchecked"}
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
          value={isOriginSelected ? "checked" : "unchecked"}
        />
      </div>
    {/if}
  </div>
</li>

{#if isOpen}
  <!-- {#each children as child} -->
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
