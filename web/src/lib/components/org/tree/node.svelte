<script lang="ts">
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"
  import { onMount } from "svelte"

  export let name = ""
  export let children: any[] = []
  export let indent = 8
  export let uuid = ""
  export let breadcrumbs: string[] = []
  export let open = false
  export let fromDate: string

  let loading = false

  const fetchChildren = async (uuid: string) => {
    const query = `
      query {
        org_units(filter: {uuids: "${uuid}", from_date: "${fromDate}"}) {
          objects {
            objects {
              children {
                name
                uuid
              }
            }
          }
        }
      }`
    const res = await fetchGraph(query)
    const json = await res.json()
    if (json.data) {
      return json.data.org_units.objects[0].objects[0].children
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
</script>

<a class="hover:no-underline" href={`${base}/organisation/${uuid}`}>
  <li class="rounded-md {$page.params.uuid === uuid ? 'bg-accent' : ''}">
    <div
      class="py-2"
      style="padding-left: {indent}px"
      id={$page.params.uuid === uuid ? "active" : ""}
    >
      {#if loading}
        <div class="animate-spin rounded-full h-4 w-4 border-b-4 border-secondary" />
      {:else if children.length}
        {#if open}
          <div class="h-4 w-4" on:click|preventDefault={toggleOpen}>
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
          <div class="h-4 w-4" on:click|preventDefault={toggleOpen}>
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
      {:else}
        <div class="h-4 w-4" />
      {/if}
      <p class="text-secondary">
        {name}
      </p>
    </div>
  </li>
</a>

{#if open}
  {#each children as child}
    <svelte:self {...child} {breadcrumbs} {fromDate} indent={indent + 24} />
  {/each}
{/if}
