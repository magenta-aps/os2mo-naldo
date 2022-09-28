<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import { fetchRest } from "$lib/util/http"
  import { goto } from "$app/navigation"
  import { offset, flip, shift } from "@floating-ui/dom"
  import { createFloatingActions } from "svelte-floating-ui"
  import { base } from "$app/paths"
  import Icon from "$lib/components/icon.svelte"

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

  $: search = async (query: string) => {
    const empRes = await fetchRest(`e/autocomplete/?query=${query}`)
    const orgRes = await fetchRest(`ou/autocomplete/?query=${query}`)
    const empJson = await empRes.json()
    const orgJson = await orgRes.json()
    return { org: orgJson.items, employee: empJson.items }
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
      class="input input-bordered text-base w-80 h-8 text-neutral"
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
              {#if results.employee.length || results.org.length}
                <tbody>
                  {#each results.employee.concat(results.org) as result}
                    <tr
                      class="hover cursor-pointer"
                      on:click={() => {
                        if (result.path) {
                          goto(`${base}/organisation/${result.uuid}`)
                        } else {
                          goto(`${base}/employee/${result.uuid}`)
                        }
                        input = ""
                      }}
                    >
                      <th class="text-neutral">
                        <div class="flex gap-2 text-base text-sm text-secondary">
                          {#if result.path}
                            <Icon type="house" />
                          {:else}
                            <Icon type="user" />
                          {/if}
                          {result.name}
                        </div>
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
                  <th class="flex justify-center"
                    >{results.employee.concat(results.org).length}</th
                  >
                </tr>
              </tfoot>
            {/await}
          </table>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <input
    type="text"
    disabled
    placeholder="Søg"
    class="input input-bordered w-80 h-8 text-neutral"
  />
{/if}
