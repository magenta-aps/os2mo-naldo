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
  import { OrgUnitChildrenDocument } from "$lib/components/org/select_tree/query.generated"
  import ArrowDown from "../../forms/shared/arrowDown.svelte"
  import ArrowRight from "../../forms/shared/arrowRight.svelte"

  export let selectedOrg: any
  export let name = ""
  export let children: any[] = []
  export let indent = 0
  export let uuid = ""
  export let fromDate: string
  export let isCheckboxMode: boolean = false
  export let allowMultipleSelection: boolean = false

  let open = false
  let loading = false

  const dispatch = createEventDispatcher()

  gql`
    query OrgUnitChildren($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            children {
              name
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
    return res.org_units?.objects[0].objects[0].children
  }

  const toggleOpen = async () => {
    if (!open) {
      loading = true
      for (let child of children) {
        if (!child.children) {
          child.children = await fetchChildren(child.uuid)
        }
      }
      loading = false
    }
    open = !open
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

  /*  TODO: problemeer med at indlæse to parent, og foldder ikke altid ud som den skal forkert tilgang? for enkel? */
  const expandRelevantBranch = async () => {
    if (allowMultipleSelection) {
      const shouldOpenOrigin = children.some(
        (child) => child.uuid === $selectedOriginUuid?.uuid
      )
      const shouldOpenDestination = $selectedDestinationUuids.some((dest) =>
        children.some((child) => child.uuid === dest.uuid)
      )

      if ((shouldOpenOrigin || shouldOpenDestination) && !open) {
        await toggleOpen()
        open = true
      }
    }
  }

  $: if ($selectedOriginUuid) {
    console.log("selectedeOrg +node", $selectedOriginUuid)
    expandRelevantBranch()
  }

  //todo: mere sigende navne?
  /*   $: isOriginSelected = $selectedOriginUuid ? $selectedOriginUuid.uuid === uuid : false*/
  $: isOriginSelected = $selectedOriginUuid && $selectedOriginUuid.uuid === uuid
  $: isDestinationSelected = $selectedDestinationUuids.some((obj) => obj.uuid === uuid)
</script>

<!-- TODO: fjern A11y ignore når checkboxer fungere som det skal, er pt tilføjet for ikke at have gule linjer over alt i koden -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li
  style="padding-left: {indent}px"
  on:click={() => {
    selectedOrg.name = name
    selectedOrg.uuid = uuid
  }}
>
  <div class="flex items-center">
    <!-- Indlæsningsindikator -->
    {#if loading}
      <div class="animate-spin rounded-full h-5 w-5 border-b-4 border-primary" />
    {:else}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- Placeholder for arrows even if no children are present, gives a better visuel experience -->
      <div
        class="flex items-center justify-center w-5 h-5 mr-2 mb-3"
        on:click={toggleOpen}
      >
        {#if children && children.length > 0}
          {#if open}
            <ArrowDown />
          {:else}
            <ArrowRight />
          {/if}
        {/if}
      </div>
    {/if}

    <!-- Navn visning for ikke-checkbox mode -->
    {#if !isCheckboxMode}
      <span class="mr-2">{name}</span>
    {/if}

    <!-- Checkbox Mode Indhold -->
    {#if isCheckboxMode}
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
    {/if}
  </div>
</li>

{#if open}
  {#each children as child}
    <svelte:self
      {...child}
      indent={indent + 30}
      {fromDate}
      {allowMultipleSelection}
      {isCheckboxMode}
      bind:selectedOrg
    />
  {/each}
{/if}
