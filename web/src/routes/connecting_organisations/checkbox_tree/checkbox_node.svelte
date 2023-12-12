<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import RadioButton from "$lib/components/forms/shared/radio_button.svelte"
  import Icon from "@iconify/svelte"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"

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

  const handleRadioChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    selectedOriginOrg = { uuid: target.id, name }
  }

  /*  FIXME: Consider alternative solutions for this function; push does not work with Svelte, use a spread operator instead.*/
  const handleCheckboxChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.checked) {
      selectedDestinationsOrgs = [
        ...selectedDestinationsOrgs,
        { uuid: target.id, name },
      ]
    } else {
      selectedDestinationsOrgs = selectedDestinationsOrgs.filter(
        (org) => org.uuid !== target.id
      )
    }
  }

  const openParentNodes = (currentUuid: string) => {
    // Opens parent nodes if they have matching children
    if (hasMatchingDescendant({ uuid, children })) {
      isOpen = true
    }
    if (parentUuid !== "") {
      dispatch("openSelf", { parentUuid: parentUuid, currentUuid: currentUuid })
    }
  }

  const hasMatchingDescendant = (node: any) => {
    // Checks for children, and if there are children, checks recursively for match.
    if (node.children) {
      for (let child of node.children) {
        if (
          selectedDestinationsOrgs.some((dest) => dest.uuid === child.uuid) ||
          hasMatchingDescendant(child)
        ) {
          return true
        }
      }
    }
    return false
  }

  const toggleNode = () => {
    isOpen = !isOpen
  }

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

  $: sortedChildren = children.sort((a, b) =>
    a.name > b.name ? 1 : a.name < b.name ? -1 : 0
  )
</script>

<li style="padding-left: {indent}px">
  <div class="flex items-center">
    <div
      role="button"
      tabindex="0"
      class="items-center justify-center mr-2"
      on:click={toggleNode}
      on:keydown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          toggleNode()
          event.preventDefault()
        }
      }}
    >
      {#if children.length}
        <Icon
          icon={keyboardArrowDownRounded}
          width="20"
          height="20"
          rotate={isOpen ? 0 : 3}
        />
      {:else}
        <!-- This creates the same space as if there was an arrow, so the tree is aligned -->
        <div class="w-5 w-5" />
      {/if}
    </div>
    {#if allowMultipleSelection}
      <div on:change={handleCheckboxChange} class="ml-2">
        <Checkbox
          id={uuid}
          title={name}
          value={uuid}
          startValue={isSelectedDestination ? uuid : ""}
          disabled={!selectedOriginOrg || selectedOriginOrg.uuid === uuid}
        />
      </div>
    {:else}
      <div on:change={handleRadioChange} class="ml-2">
        <RadioButton
          groupName="originUuid"
          id={uuid}
          title={name}
          value={uuid}
          startValue={isSelectedOrigin ? uuid : ""}
        />
      </div>
    {/if}
  </div>
</li>

{#if isOpen}
  {#each sortedChildren as child}
    <svelte:self
      {...child}
      bind:orgTree
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
