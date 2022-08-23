<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import { fetchGraph } from "$lib/util/http"

  $: query = `
    query {
      org {
        uuid
        name
      }
    }
  `
  const fetchOrgs = async (query: string) => {
    const res = await fetchGraph(query)
    const json = await res.json()
    if (json.data) {
      return json.data.org
    } else {
      throw new Error(json.errors[0].message)
    }
  }
</script>

<ul class="menu p-4 overflow-y-auto bg-base-300 text-base-content">
  <!-- Sidebar content here -->
  <li class="mb-2"><a href="/employee">Medarbejdere</a></li>

  <div class="divider" />

  {#if $isAuth}
    {#await fetchOrgs(query)}
      <div class="m-auto">
        <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
      </div>
    {:then orgs}
      <p>{orgs.name}</p>
    {:catch error}
      <p>{error}</p>
    {/await}
  {:else}
    <div class="m-auto">
      <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
      <p class="pt-6">Authentication...</p>
    </div>
  {/if}
</ul>
