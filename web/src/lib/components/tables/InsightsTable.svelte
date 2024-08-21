<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { resolveFieldValue, type Field, type SelectedQuery } from "$lib/util/helpers"
  import { formatDate } from "$lib/util/date"

  export let data: any
  export let headers: SelectedQuery[]
</script>

<div class="overflow-x-auto rounded border mb-8">
  <table class="border-slate-300 w-full">
    {#if headers && headers.length}
      {#each headers as selectedQuery}
        {#each selectedQuery.chosenFields as chosenField}
          <!-- Add column to show both org_units in the relation -->
          {#if chosenField.value === "related_unit"}
            <th
              class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
            >
              <div class="flex items-center">
                {capital($_(chosenField.value, { values: { n: 1 } }))}
              </div>
            </th>
            <th
              class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
            >
              <div class="flex items-center">
                {capital($_(chosenField.value, { values: { n: 1 } }))}
              </div>
            </th>
            <!-- Add column to seperate validity from/to -->
          {:else if chosenField.value === "validity"}
            <th
              class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
            >
              <div class="flex items-center">
                {capital($_("from"))}
              </div>
            </th>
            <th
              class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
            >
              <div class="flex items-center">
                {capital($_("to"))}
              </div>
            </th>
          {:else}
            <th
              class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
            >
              <div class="flex items-center">
                {capital($_(chosenField.value, { values: { n: 1 } }))}
              </div>
            </th>
          {/if}
        {/each}
      {/each}
    {:else}
      <thead class="text-left">
        <th
          class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
        >
          <div class="flex items-center">{capital($_("choose_header"))}</div>
        </th>
      </thead>
    {/if}
    <tbody class="border-slate-300 min-h-64 text-slate-600">
      {#if !data}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <td class="p-4">...</td>
        </tr>
      {:else if data && headers}
        {#each data as mainQuery}
          {console.log(mainQuery)}
          <!-- Loop over each key in mainQuery -->
          {#each Object.keys(mainQuery) as key}
            {#if Array.isArray(mainQuery[key])}
              <!-- Loop over each object in the array under the current key -->
              {#each mainQuery[key] as searchObject}
                <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
                  {#each headers as selectedQuery}
                    {#each selectedQuery.chosenFields as chosenField}
                      {#if searchObject}
                        {#if chosenField.value === "validity" && searchObject.validity}
                          <td class="p-4">
                            {searchObject.validity.from
                              ? formatDate(searchObject.validity.from)
                              : ""}
                          </td>
                          <td class="p-4">
                            {searchObject.validity.to
                              ? formatDate(searchObject.validity.to)
                              : ""}
                          </td>
                        {:else if chosenField.value === "manager_responsibility"}
                          <ul>
                            {#if searchObject.responsibilities}
                              {#each searchObject.responsibilities as responsibility}
                                <li>• {responsibility.name}</li>
                              {/each}
                            {/if}
                          </ul>
                        {:else if chosenField.value === "related_unit"}
                          {#if searchObject.org_units && searchObject.org_units.length >= 2}
                            <td class="p-4">{searchObject.org_units[1].name}</td>
                            <td class="p-4">{searchObject.org_units[0].name}</td>
                          {:else}
                            <td class="p-4">N/A</td>
                          {/if}
                        {:else}
                          <td class="p-4">
                            {resolveFieldValue(searchObject, chosenField)}
                          </td>
                        {/if}
                      {/if}
                    {/each}
                  {/each}
                </tr>
              {/each}
            {/if}
          {/each}
        {/each}
      {/if}
    </tbody>
  </table>
</div>
