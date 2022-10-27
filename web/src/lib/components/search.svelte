<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import { fetchRest } from "$lib/util/http"
  import { goto } from "$app/navigation"
  import { offset, flip, shift } from "@floating-ui/dom"
  import { createFloatingActions } from "svelte-floating-ui"
  import { base } from "$app/paths"

  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: "absolute",
    placement: "bottom",
    middleware: [offset(6), flip(), shift()],
  })

  let input = ""
  let isFocused = false

  const delayedUnfocus = () => {
    // Stupid hack to make the floatingContent be clickable before it disappears
    setTimeout(() => (isFocused = false), 250)
  }

  const search = async (query: string) => {
    const res = await fetchRest(`e/autocomplete/?query=${query}`)
    const json = await res.json()
    return json.items
  }
</script>

{#if $isAuth}
  <div use:floatingRef>
    <input
      bind:value={input}
      on:focus={() => (isFocused = true)}
      on:blur={delayedUnfocus}
      type="text"
      placeholder="Søg"
      class="input input-bordered rounded text-base w-80 h-8 text-neutral"
    />
    {#if isFocused && input}
      <div use:floatingContent>
        <div class="overflow-x-auto shadow-lg w-80 max-h-96">
          <table class="table table-compact w-full text-neutral">
            {#await search(input)}
              <tbody>
                <tr>
                  <th class="flex justify-center">Loading...</th>
                </tr>
              </tbody>
            {:then results}
              {#if results.length}
                <tbody>
                  {#each results as result}
                    <tr
                      class="hover cursor-pointer"
                      on:click={() => {
                        goto(`${base}/employee/${result.uuid}`)
                        input = ""
                      }}
                    >
                      <th class="text-neutral">
                        <a
                          class="text-base text-secondary"
                          href={`${base}/employee/${result.uuid}`}
                        >
                          {result.name}
                        </a>
                      </th>
                    </tr>
                  {/each}
                </tbody>
              {:else}
                <tbody>
                  <tr>
                    <th class="flex justify-center text-neutral">Ingen resultater </th>
                  </tr>
                </tbody>
              {/if}
              <tfoot>
                <tr>
                  <th class="flex justify-center">{results.length}</th>
                </tr>
              </tfoot>
            {/await}
          </table>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div use:floatingRef>
    <input
      type="text"
      disabled
      placeholder="Søg"
      class="input input-bordered rounded text-base w-80 h-8 text-neutral"
    />
  </div>
{/if}
