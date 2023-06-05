<script lang="ts">
  import { fetchGraph } from "$lib/util/http"
  import Node from "$lib/components/org/select_tree/node.svelte"
  import { offset, flip, shift } from "@floating-ui/dom"
  import { createFloatingActions } from "svelte-floating-ui"
  import { date } from "$lib/stores/date"

  export let selectedOrg: { name: string, uuid?: any | null }
  export let startOrg: { name: string, uuid?: any | null } | null | undefined = {name: "", uuid: ""}
  selectedOrg = selectedOrg ?? startOrg  // For flexibility when binding
  export let labelText = "Angiv overenhed"
  export let id = "select-org-tree"
  export let required = true
  let orgTree: any[] = []
  let isFocused = false

  const query = `
    query {
      org_units (from_date: "${$date}") {
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
    }`

  const fetchOrgTree = async (query: string) => {
    const res = await fetchGraph(query)
    const json = await res.json()
    if (json.data) {
      for (let org of json.data.org_units) {
        if (org.objects[0].parent === null) {
          orgTree.push({
            uuid: org.uuid,
            name: org.objects[0].name,
            children: org.objects[0].children,
            fromDate: $date,
          })
        }
      }
    } else {
      throw new Error(json.errors ? json.errors[0].message : "Unknown error")
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
</script>

{#await fetchOrgTree(query)}
  <div class="form-control pb-4">
    <label for={id} class="text-sm text-secondary pb-1">
      {labelText}
      <span class="animate-spin rounded-full h-6 w-6 border-b-4 border-primary" />
    </label>
    <input disabled class="input input-bordered input-sm rounded w-full" />
  </div>
{:then}
  <div class="form-control pb-4">
    <label for={id} class="text-sm text-secondary pb-1">
      {labelText}
    </label>
    <div use:floatingRef>
      <input
        {id}
        {required}
        on:focus={() => {
          isFocused = true
        }}
        bind:value={selectedOrg.name}
        class="input input-bordered input-sm text-base text-secondary font-normal rounded active:input-primary focus:input-primary w-full active:outline-offset-0 focus:outline-offset-0"
      />

      <!-- Hidden hack to return the UUID while displaying the name -->
      <input hidden {id} name={id} bind:value={selectedOrg.uuid} />
      {#if isFocused}
        <div
          use:floatingContent
          class="w-96 max-w-full px-5"
          on:mouseleave={delayedUnfocus}
        >
          <ul class="menu bg-base-200 ">
            {#each orgTree as child}
              <Node {...child} bind:selectedOrg />
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>
{/await}
