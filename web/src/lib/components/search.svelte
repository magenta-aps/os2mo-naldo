<script lang="ts">
  import { isAuth } from "$lib/stores/auth"

  // const url = "http://localhost:5001/service/e/autocomplete/?query="
  let input: string
  // TODO: Get employee and org interfaces
  let results: [any]

  const search = async (query: string) => {
    const url = `http://localhost:5001/service/e/autocomplete/?query=${query}`

    const res = await fetch(url)
    const json = await res.json()
    results = json.items
    console.log(json.items)
  }

  console.log("hest")
  console.log($isAuth)
  // $: search(input)
</script>

{#if $isAuth}
  <input
    bind:value={input}
    on:input={search(input)}
    list="search-results"
    type="text"
    placeholder="Type here"
    class="input w-full max-w-xs"
  />

  <datalist id="search-results">
    {#if results}
      {#each results as result}
        <option value={result.name} />
        {result}
      {/each}
    {/if}
  </datalist>
{:else}
  <input type="text" disabled placeholder="Type here" class="input w-full max-w-xs" />
{/if}
