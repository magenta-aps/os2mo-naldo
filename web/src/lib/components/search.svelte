<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import { fetchRest } from "$lib/util/http"
  import { goto } from "$app/navigation"
  import { offset, flip, shift } from "@floating-ui/dom"
  import { createFloatingActions } from "svelte-floating-ui"

  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: "absolute",
    placement: "top",
    middleware: [offset(6), flip(), shift()],
  })

  let input = ""

  const search = async (query: string) => {
    const url = `http://localhost:5001/service/e/autocomplete/?query=${query}`
    const res = await fetchRest(url)
    const json = await res.json()
    return json.items
  }
</script>

{#if $isAuth}
  <div use:floatingRef>
    <input
      bind:value={input}
      type="text"
      placeholder="Søg"
      class="input input-bordered w-44"
    />
    {#if input}
      <div use:floatingContent>
        <div class="overflow-x-auto shadow-lg w-44">
          <table class="table table-compact w-full">
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
                        goto(`/employee/${result.uuid}`)
                        input = ""
                      }}
                    >
                      <th>
                        <a href={`/employee/${result.uuid}`}>
                          {result.name}
                        </a>
                      </th>
                    </tr>
                  {/each}
                </tbody>
              {:else}
                <tbody>
                  <tr>
                    <th class="flex justify-center">Ingen resultater </th>
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
  <input type="text" disabled placeholder="Søg" class="input w-44" />
{/if}
