<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import RadioButton from "$lib/components/forms/shared/radio_button.svelte"
  import Icon from "$lib/components/icon.svelte"

  export let name = ""
  export let children: any[] = []
  export let indent = 0
  export let uuid = ""
  export let allowMultipleSelection: boolean = false
  export let parentUuid: string = ""

  export let orgTree: any[] = []
  export let selectedOriginOrg: { uuid: string; name: string } | null = null
  export let selectedDestinationsOrgs: { uuid: string; name: string }[] = []

  let isOpen = false
  const dispatch = createEventDispatcher()

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement
    const isChecked = target.checked
    const uuid = target.id

    if (target.type === "radio") {
      selectedOriginOrg = isChecked ? { uuid, name } : null
      dispatch("radioChanged", { isChecked, uuid })
    } else if (target.type === "checkbox") {
      if (isChecked) {
        selectedDestinationsOrgs.push({ uuid, name })
        selectedDestinationsOrgs = [...selectedDestinationsOrgs]
      } else {
        selectedDestinationsOrgs = selectedDestinationsOrgs.filter(
          (org) => org.uuid !== uuid
        )
      }
      dispatch("checkboxChanged", { isChecked, uuid })
    }
  }

  function openParentNodes(currentUuid: string): void {
    if (hasMatchingDescendant({ uuid, children })) {
      isOpen = true
    }

    if (parentUuid !== "") {
      dispatch("openSelf", { parentUuid: parentUuid, currentUuid: currentUuid })
    }
  }

  function hasMatchingDescendant(node: any): boolean {
    // Checks for children, and if there are children, checks recursively for match.
    if (node.children) {
      for (let child of node.children) {
        if (selectedDestinationsOrgs.some((dest) => dest.uuid === child.uuid)) {
          return true
        } else if (hasMatchingDescendant(child)) {
          return true
        }
      }
    }
    return false
  }

  const toggleNode = () => {
    isOpen = !isOpen
  }

  // "Code to reset the value in selectedOriginOrg when it's hidden due to a node being closed."
  /*  const openNode = async () => {
    if (!isOpen) {
      isOpen = true
    }
  } */

  // "Code to reset the value in selectedOriginOrg when it's hidden due to a node being closed."
  /* const closeNode = () => {
    if (!isOpen) return
    if (isOpen) {
      if (
        !allowMultipleSelection &&
        selectedOriginOrg &&
        !isUuidVisible(
          { children, isOpen: false, uuid: parentUuid },
          selectedOriginOrg.uuid
        )
      )  {
        selectedOriginOrg = null
        selectedDestinationsOrgs = []
      } 
      isOpen = false
    }
  } */
  // "Code to reset the value in selectedOriginOrg when it's hidden due to a node being closed."
  /*  function isUuidVisible(node: any, uuidToCheck: string): boolean {
    if (node.uuid === uuidToCheck && node.isOpen) return true

    if (node.children) {
      for (let child of node.children) {
        if (isUuidVisible(child, uuidToCheck)) {
          return true
        }
      }
    }
    return false
  } */

  $: if (selectedOriginOrg && allowMultipleSelection) {
    selectedDestinationsOrgs.forEach((destination) => {
      openParentNodes(destination.uuid)
    })
  }

  $: if (selectedOriginOrg === null && allowMultipleSelection) {
    isOpen = false
  }

  $: isSelectedOrigin = selectedOriginOrg && selectedOriginOrg.uuid === uuid
  $: isSelectedDestination = selectedDestinationsOrgs.some((obj) => obj.uuid === uuid)

  $: sortedChildren = children
    .slice()
    .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))
</script>

<!-- "Code to reset the value in selectedOriginOrg when it's hidden due to a node being closed." -->
<!-- <li style="padding-left: {indent}px">
  <div class="flex items-center">
    <div
      role="button"
      tabindex="0"
      class="flex items-center justify-center w-5 h-5 mr-2 mb-3"
      on:click={isOpen ? closeNode : openNode}
      on:keydown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          isOpen ? closeNode() : openNode()
          event.preventDefault()
        }
      }}
    >
      {#if children.length}
        <Icon type="arrow" class={isOpen ? "transform rotate-90" : ""} />
      {/if}
    </div>

    {#if allowMultipleSelection}
      <div on:change={handleInputChange} class="ml-2">
        <Checkbox
          id={uuid}
          title={name}
          value="checked"
          startValue={isSelectedDestination ? "checked" : "unchecked"}
          disabled={!selectedOriginOrg || selectedOriginOrg.uuid === uuid}
        />
      </div>
    {:else}
      <div on:change={handleInputChange} class="ml-2">
        <RadioButton
          groupName="originUuid"
          id={uuid}
          title={name}
          value="checked"
  startValue={isSelectedOrigin ? "checked" : "unchecked"}
/>
      
      </div>
    {/if}
  </div>
</li> -->

<li style="padding-left: {indent}px">
  <div class="flex items-center">
    <div
      role="button"
      tabindex="0"
      class="flex items-center justify-center w-5 h-5 mr-2 mb-3"
      on:click={toggleNode}
      on:keydown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          toggleNode()
          event.preventDefault()
        }
      }}
    >
      {#if children.length}
        <Icon type="arrow" class={isOpen ? "transform rotate-90" : ""} />
      {/if}
    </div>

    {#if allowMultipleSelection}
      <div on:change={handleInputChange} class="ml-2">
        <Checkbox
          id={uuid}
          title={name}
          value="checked"
          startValue={isSelectedDestination ? "checked" : "unchecked"}
          disabled={!selectedOriginOrg || selectedOriginOrg.uuid === uuid}
        />
      </div>
    {:else}
      <div on:change={handleInputChange} class="ml-2">
        <RadioButton
          groupName="originUuid"
          id={uuid}
          title={name}
          value="checked"
          startValue={isSelectedOrigin ? "checked" : "unchecked"}
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
      {allowMultipleSelection}
      bind:selectedDestinationsOrgs
      bind:selectedOriginOrg
      parentUuid={uuid}
      on:openSelf={(e) => {
        isOpen = true
        e.stopPropagation()
      }}
      on:requestParentOpen={(e) => {
        if (e.detail.parentUuid === uuid) {
          isOpen = true
          if (parentUuid !== "") {
            dispatch("requestParentOpen", { parentUuid: parentUuid, currentUuid: uuid })
          }
        }
      }}
    />
  {/each}
{/if}
