<script lang="ts">
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"

  export let name = ""
  export let children: any[] = []
  export let indent = 0
  export let uuid = ""

  let open = false
  let loading = false

  const fetchChildren = async (uuid: string) => {
    const findQuery = `
      query {
        org_units(uuids: "${uuid}") {
          objects {
            children {
              name
              uuid
            }
          }
        }
      }`
    const res = await fetchGraph(findQuery)
    const json = await res.json()
    if (json.data) {
      return json.data.org_units[0].objects[0].children
    } else {
      throw new Error(json.errors[0].message)
    }
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
</script>

<a href={`/organisation/${uuid}`}>
  <li style="padding-left: {indent}px">
    <div class={$page.params.uuid === uuid ? "bg-primary text-primary-content" : ""}>
      {#if loading}
        <div
          class="animate-spin rounded-full h-5 w-5 border-b-4 {$page.params.uuid ===
          uuid
            ? 'border-primary-content'
            : 'border-primary'}"
        />
      {:else if children.length}
        <p on:click={toggleOpen}>{open ? "⌄" : "➤"}</p>
      {/if}
      {name}
    </div>
  </li>
</a>

{#if open}
  {#each children as child}
    <svelte:self {...child} indent={indent + 24} />
  {/each}
{/if}
