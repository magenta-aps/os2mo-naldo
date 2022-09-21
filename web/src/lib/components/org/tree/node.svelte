<script lang="ts">
  import { base } from "$app/paths"

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

<a class="hover:no-underline" href={`${base}/organisation/${uuid}`}>
  <li style="padding-left: {indent}px">
    <div class={$page.params.uuid === uuid ? "bg-accent" : ""}>
      {#if loading}
        <div class="animate-spin rounded-full h-4 w-4 border-b-4 border-secondary" />
      {:else if children.length}
        {#if open}
          <div class="h-4 w-4" on:click={toggleOpen}>
            <svg
              class="fill-secondary"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              ><path
                d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
              /></svg
            >
          </div>
        {:else}
          <div class="h-4 w-4" on:click={toggleOpen}>
            <svg
              class="fill-secondary"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              ><path
                d="M342.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L274.7 256 105.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
              /></svg
            >
          </div>
        {/if}
      {/if}
      <p class="text-secondary">
        {name}
      </p>
    </div>
  </li>
</a>

{#if open}
  {#each children as child}
    <svelte:self {...child} indent={indent + 24} />
  {/each}
{/if}
