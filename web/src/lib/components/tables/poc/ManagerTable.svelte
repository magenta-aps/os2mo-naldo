<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"

  export let data
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as manager}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">
        {manager.objects[0].person[0].name}
      </td>
      <td class="p-4">
        {manager.objects[0].org_unit[0].name}
      </td>
      <td class="p-4">
        <ul>
          {#if manager.objects[0].person[0].addresses.length}
            {#each manager.objects[0].person[0].addresses as address}
              <li>
                • {address.name}
              </li>
            {/each}
          {/if}
        </ul>
      </td>
      <td class="p-4">
        <ul>
          {#each manager.objects[0].responsibilities as responsibility}
            <li>
              • {responsibility.name}
            </li>
          {/each}
        </ul>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <!-- TODO: Add translated "No <type> in <tense>"-message" -->
      <td class="p-4"
        >{capital(
          $_("no_item", { values: { item: $_("manager", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
