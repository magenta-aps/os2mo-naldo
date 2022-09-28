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
      class="input input-bordered text-base w-[50rem] h-8 text-neutral"
    />
    {#if isFocused && input}
      <div use:floatingContent>
        <div class="overflow-x-auto shadow-lg w-[50rem] max-h-96">
          <table class="table table-compact w-full text-neutral">
            {#await search(input)}
              <tbody>
                <tr>
                  <th class="flex justify-center">Loading...</th>
                </tr>
              </tbody>
            {:then results}
              <!-- Employee split -->

              <div class="flex w-full">
                <div class="grid flex-grow place-items-center">
                  {#if results.employee.length}
                    <tbody>
                      {#each results.employee as result}
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
                        <th class="flex justify-center text-neutral"
                          >Ingen resultater
                        </th>
                      </tr>
                    </tbody>
                  {/if}
                </div>

                <div class="divider divider-horizontal" />

                <div class="grid flex-grow place-items-center">
                  <!-- Org unit split -->
                  <div class="flex w-full">
                    {#if results.org.length}
                      <tbody>
                        {#each results.org as result}
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
                          <th class="flex justify-center text-neutral"
                            >Ingen resultater
                          </th>
                        </tr>
                      </tbody>
                    {/if}
                  </div>
                </div>
              </div>
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
  <input
    type="text"
    disabled
    placeholder="Søg"
    class="input input-bordered w-80 h-8 text-neutral"
  />
{/if}
