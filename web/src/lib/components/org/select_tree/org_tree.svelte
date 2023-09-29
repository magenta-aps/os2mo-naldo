<script lang="ts">
  import { graphQLClient } from "$lib/util/http"
  import Node from "$lib/components/org/select_tree/node.svelte"
  import { offset, flip, shift } from "@floating-ui/dom"
  import { createFloatingActions } from "svelte-floating-ui"
  import { date } from "$lib/stores/date"
  import { gql } from "graphql-request"
  import { OrgTreeDocument } from "./query.generated"
  import { createEventDispatcher } from "svelte"

  export let selectedOrg: { name: string; uuid?: any | null }
  export let startOrg: { name: string; uuid?: any | null } | null | undefined = {
    name: "",
    uuid: "",
  }
  selectedOrg = selectedOrg ?? startOrg // For flexibility when binding
  export let labelText = "Angiv overenhed"
  export let id = "select-org-tree"
  export let required = true
  export let isCheckboxMode: boolean = false
  export let allowMultipleSelection: boolean = false
  export let relatedUnits: any[] = []

  let orgTree: any[] = []
  let isFocused = false

  const dispatch = createEventDispatcher()

  gql`
    query OrgTree($from_date: DateTime!) {
      org_units(filter: { from_date: $from_date }) {
        objects {
          uuid
          objects {
            name
            uuid
            parent {
              name
              uuid
            }
            children {
              name
              uuid
            }
          }
        }
      }
    }
  `

  const fetchOrgTree = async () => {
    const data = await graphQLClient().request(OrgTreeDocument, { from_date: $date })
    if (data.org_units) {
      for (let org of data.org_units.objects) {
        if (org.objects[0].parent === null) {
          orgTree.push({
            uuid: org.uuid,
            name: org.objects[0].name,
            children: org.objects[0].children,
            fromDate: $date,
          })
        }
      }
    }
  }

  const delayedUnfocus = () => {
    // Stupid hack to make the floatingContent be clickable before it disappears
    setTimeout(() => (isFocused = false), 250)
  }

  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: "absolute",
    placement: "bottom",
    middleware: [offset(6), flip(), shift()],
  })

  function handleCheckboxChangeFromNode(event: CustomEvent) {
    console.log("org_tree-radionChange")
    dispatch("checkboxChanged", { detail: event.detail })
  }

  function handleRadioChangeFromNode(event: CustomEvent) {
    console.log("org_tree-radionChange")
    dispatch("radioChanged", { detail: event.detail })
  }
</script>

<!-- TODO: fjern A11y ignore når checkboxer fungere som det skal igen, er pt tilføjet for ikke at have gule linjer over alt i koden -->
<!-- TODO: tjek at træet bliver vist ordenligt som dropdown efter der er ændret i klasserne, ellers skal labeltext også flyttes ind i if/else -->
<!-- TODO: det ser måske lidt sjovt ud med spinning wheel ved siden af overskrifterne? -->
{#await fetchOrgTree()}
  <div class="form-control pb-4 flex flex-col">
    <label for={id} class="text-sm text-secondary pb-1 h-6 break-words flex items-end">
      <!-- <label for={id} class="text-sm text-secondary pb-1"> -->
      {labelText}
      <span class="animate-spin rounded-full h-6 w-6 border-b-4 border-primary" />
    </label>
    <input disabled class="input input-bordered input-sm rounded w-full" />
  </div>
{:then data}
  <div class="form-control pb-4 flex flex-col">
    <label for={id} class="text-sm text-secondary pb-1 h-6 break-words flex items-end">
      {labelText}
    </label>

    {#if isCheckboxMode}
      <!-- Checkbox Mode Content -->
      <div use:floatingRef class="max-w-full">
        <ul class="menu bg-white rounded border">
          {#each orgTree as child}
            <Node
              {...child}
              bind:selectedOrg
              {isCheckboxMode}
              {allowMultipleSelection}
              {relatedUnits}
              on:checkboxChanged={handleCheckboxChangeFromNode}
              on:radioChanged={handleRadioChangeFromNode}
            />
          {/each}
        </ul>
      </div>
    {:else}
      <!-- Standard Mode Content -->
      {#if isFocused}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          use:floatingContent
          class="w-96 max-w-full px-5"
          on:mouseleave={delayedUnfocus}
        >
          <ul class="menu bg-base-200">
            {#each orgTree as child}
              <Node {...child} bind:selectedOrg />
            {/each}
          </ul>
        </div>
      {:else}
        <input
          {id}
          {required}
          on:focus={() => {
            isFocused = true
          }}
          bind:value={selectedOrg.name}
          class="input input-bordered input-sm text-base text-secondary font-normal rounded active:input-primary focus:input-primary w-full active:outline-offset-0 focus:outline-offset-0"
        />
        <!-- Hidden input for single select when checkboxes are not used -->
        <input hidden {id} name={id} bind:value={selectedOrg.uuid} />
      {/if}
    {/if}
  </div>
{/await}
