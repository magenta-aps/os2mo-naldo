<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import { resolveFieldValue, type Field } from "$lib/util/helpers"

  export let data: any
  export let headers: Field[]

  // $: {
  //   if (data) {
  //     const results = []

  //     for (const outer of data[mainQuery.operation].objects) {
  //       // TODO: Remove when GraphQL is able to do this for us
  //       const filtered = outer.validities.filter((obj) => {
  //         return tenseFilter(obj, tense)
  //       })
  //       results.push(...filtered)
  //     }

  //     data = results
  //   }
  // }
</script>

<div class="overflow-x-auto rounded border mb-8">
  <table class="border-slate-300 w-full">
    {#if headers}
      <thead class="text-left">
        {#each headers as header}
          <th
            class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
          >
            <div class="flex items-center">{$_(header.value)}</div>
          </th>
        {/each}
      </thead>
    {/if}
    <tbody class="border-slate-300 min-h-64 text-slate-600">
      {#if !data}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <td class="p-4">Intet valgt</td>
        </tr>
      {:else if data && headers}
        {console.log(data)}
        {#each data as searchObject}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
            <!-- This check is needed since, if fields are cleared (after making a query), it will break with -->
            <!-- Error: {#each} only works with iterable values. -->
            {#each headers as header, i}
              {#if header.value === "validity" && searchObject.validity}
                <ValidityTableCell validity={searchObject.validity} />
              {:else if header.value === "manager_responsibility"}
                <ul>
                  {#each searchObject.responsibilities as responsibility}
                    <li>
                      • {responsibility.name}
                    </li>
                  {/each}
                </ul>
              {:else}
                <td class="p-4">
                  {resolveFieldValue(searchObject, header)}
                </td>
              {/if}
            {/each}
          </tr>
        {:else}
          <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
            <!-- TODO: Add translated "No <type> in <tense>"-message" -->
            <td class="p-4"
              >{capital(
                $_("no_item", {
                  values: { item: $_("data", { values: { n: 2 } }) },
                })
              )}</td
            >
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
