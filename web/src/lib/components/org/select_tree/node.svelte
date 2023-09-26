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

  export let breadcrumbs: string[] = []
  export let selectedOrg: any
  export let name = ""
  export let children: any[] = []
  export let indent = 0
  export let uuid = ""
  export let fromDate: string
  let open = false
  let loading = false

  /* TODO: usechecbox  og multiselect skal som udgangspunkt være false */
  export let useCheckbox: boolean = false
  export let multiSelect: boolean = false
  let isChecked = false
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

  const expandToActiveChild = async () => {
    if (breadcrumbs && breadcrumbs[0] === uuid) {
      // Removes used UUID
      breadcrumbs = breadcrumbs.slice(1)
      await toggleOpen()

      // Exhausted breadcrumbs and the correct org should be visible
      if (breadcrumbs.length === 0) {
        const activeNode = document.getElementById("active")
        if (activeNode) {
          activeNode.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          })
        }
      }
    } else {
      // If UUID isn't a match, you're down a wrong branch
      breadcrumbs = []
    }
  }

  onMount(async () => {
    await expandToActiveChild()
  })

  const handleRadioChange = (event: CustomEvent) => {
    const isChecked = event.detail.isChecked
    if (isChecked) {
      selectedOriginUuid.set({ uuid, name })
    } else {
      selectedOriginUuid.set(null)
    }
    dispatch("update", { origin: $selectedOriginUuid })
  }

  const handleCheckboxChange = (event: CustomEvent) => {
    const isChecked = event.detail.isChecked
    selectedDestinationUuids.update((currentDestinations) => {
      if (isChecked) {
        return [...currentDestinations, { uuid, name }]
      } else {
        return currentDestinations.filter((org) => org.uuid !== uuid)
      }
    })
    dispatch("update", { destinations: $selectedDestinationUuids })
  }

  let checkboxValue: string = isChecked ? "checked" : "unchecked"

  $: checkboxValue = isChecked ? "checked" : "unchecked"
</script>

<li
  style="padding-left: {indent}px"
  on:click={() => {
    selectedOrg.name = name
    selectedOrg.uuid = uuid
  }}
>
  <div>
    {#if loading}
      <div class="animate-spin rounded-full h-5 w-5 border-b-4 border-primary" />
    {:else if children && children.length > 0}
      <!-- TODO: hvilke pile skal benyttes ved toggle? -->
      <p on:click={toggleOpen}>{open ? "⌄" : "➤"}</p>
    {/if}
    {#if useCheckbox}
      {#if multiSelect}
        <Checkbox
          id={uuid}
          title={name}
          value={checkboxValue}
          on:checkboxChanged={handleCheckboxChange}
        />
      {:else}
        <RadioButton
          groupName="origenUuid"
          id={uuid}
          title={name}
          value={checkboxValue}
          on:radioChanged={handleRadioChange}
        />
      {/if}
    {:else}
      {name}
    {/if}
  </div>
</li>

{#if open}
  {#each children as child}
    <svelte:self
      {...child}
      indent={indent + 24}
      {fromDate}
      {multiSelect}
      {useCheckbox}
      bind:selectedOrg
    />
  {/each}
{/if}
