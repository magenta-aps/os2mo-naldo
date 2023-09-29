<script lang="ts">
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { createEventDispatcher } from "svelte"
  import {
    selectedDestinationUuids,
    selectedOriginUuid,
  } from "$lib/stores/selectedItem"
  import { onMount } from "svelte"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import RadioButton from "$lib/components/forms/shared/radioButton.svelte"
  import { OrgUnitChildrenDocument } from "$lib/components/org/select_tree/query.generated"

  export let selectedOrg: any
  export let name = ""
  export let children: any[] = []
  export let indent = 0
  export let uuid = ""
  export let fromDate: string
  export let isCheckboxMode: boolean = false
  export let allowMultipleSelection: boolean = false
  export let relatedUnits: any[] = []

  let open = false
  let loading = false
  /*  export let isChecked: boolean = false */
  /*let checkboxValue: string = isChecked ? "checked" : "unchecked"*/

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

  /* TODO: rydde op i handlere de er meget ens */
  const handleRadioChange = (event: Event) => {
    console.log("event udsent fra node radio")
    const target = event.target as HTMLInputElement
    const isChecked = target.checked
    const uuid = target.id
    console.log("node-radio", isChecked)
    if (target && target.checked) {
      // Tjek for target's eksistens
      selectedOriginUuid.set({ uuid, name })
    } else {
      selectedOriginUuid.set(null)
    }
    dispatch("radioChanged", { isChecked, uuid })
  }

  const handleCheckboxChange = (event: Event) => {
    console.log("event udsent fra node box")
    const target = event.target as HTMLInputElement
    const isChecked = target.checked
    const uuid = target.id
    console.log("node-checkbox", isChecked)
    if (target && target.checked) {
      // Tjek for target's eksistens
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

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement
    const isChecked = target.checked
    const uuid = target.id

    // Kontrollér, om det er en radio eller checkbox
    if (target.type === "radio") {
      handleRadioChange(event)
    } else if (target.type === "checkbox") {
      handleCheckboxChange(event)
    }
  }

  //todo: mere sigende navne fx $: isOriginSelected og $: isDestinationSelected?
  //todo: logikken i denne $: isCheckedOrigin = $selectedOriginUuid ? $selectedOriginUuid.uuid === uuid : false og i knappen er næsten den samme disabled={($selectedOriginUuid && $selectedOriginUuid.uuid === uuid) || false}

  $: isCheckedOrigin = $selectedOriginUuid ? $selectedOriginUuid.uuid === uuid : false
  $: isCheckedDestination = $selectedDestinationUuids.some((obj) => obj.uuid === uuid)

  //TODO: skal denne benyttes
  /*  onMount(async () => {}) */
</script>

<!-- TODO: fjern A11y ignore når checkboxer fungere som det skal igen, er pt tilføjet for ikke at have gule linjer over alt i koden -->

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li
  style="padding-left: {indent}px"
  on:click={() => {
    selectedOrg.name = name
    selectedOrg.uuid = uuid
  }}
>
  <div>
    <!-- Indlæsningsindikator -->
    {#if loading}
      <div class="animate-spin rounded-full h-5 w-5 border-b-4 border-primary" />
    {:else if children && children.length > 0}
      <!-- TODO: hvilke pile skal benyttes ved toggle? -->
      <!-- <p on:click={toggleOpen}>{open ? "⌄" : "➤"}</p> -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <p on:click={toggleOpen}>{open ? "⌄" : ">"}</p>
    {/if}

    <!-- Navn visning for ikke-checkbox mode -->
    {#if !isCheckboxMode}
      {name}
    {/if}

    <!--   TODO: hvordan bliver dette stylet korrekt? -->
    <!-- Checkbox Mode Indhold -->
    {#if isCheckboxMode}
      {#if allowMultipleSelection}
        <div on:change={handleInputChange}>
          <Checkbox
            id={uuid}
            title={name}
            value="checked"
            startValue={isCheckedDestination ? "checked" : "unchecked"}
            on:change={(event) => handleCheckboxChange(event)}
            disabled={!$selectedOriginUuid ||
              ($selectedOriginUuid && $selectedOriginUuid.uuid === uuid)}
          />
        </div>
      {:else}
        <div on:change={handleInputChange}>
          <RadioButton
            groupName="originUuid"
            id={uuid}
            title={name}
            value={isCheckedOrigin ? "checked" : "unchecked"}
            on:change={(event) => handleRadioChange(event)}
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
      indent={indent + 24}
      {fromDate}
      {allowMultipleSelection}
      {isCheckboxMode}
      bind:selectedOrg
    />
  {/each}
{/if}
