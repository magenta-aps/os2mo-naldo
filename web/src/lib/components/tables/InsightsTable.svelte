<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { resolveFieldValue, type Field } from "$lib/util/helpers"
  import { formatDate } from "$lib/util/date"

  export let data: any
  export let headers: Field[]
</script>

<div class="overflow-x-auto rounded border mb-8">
  <table class="border-slate-300 w-full">
    {#if headers && headers.length}
      <thead class="text-left">
        {#each headers as header}
          <!-- Add column to show both org_units in the relation -->
          {#if header.value === "related_unit"}
            <th
              class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
            >
              <div class="flex items-center">
                {capital($_(header.value, { values: { n: 1 } }))}
              </div>
            </th>
            <th
              class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
            >
              <div class="flex items-center">
                {capital($_(header.value, { values: { n: 1 } }))}
              </div>
            </th>
            <!-- Add column to seperate validity from/to -->
          {:else if header.value === "validity"}
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
                {capital($_(header.value, { values: { n: 1 } }))}
              </div>
            </th>
          {/if}
        {/each}
      </thead>
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
        {console.log(data)}
        {#each data as searchObject}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
            <!-- This check is needed since, if fields are cleared (after making a query), it will break with -->
            <!-- Error: {#each} only works with iterable values. -->
            {#each headers as header}
              {#if header.value === "validity" && searchObject.validity}
                <td class="p-4"
                  >{searchObject.validity.from
                    ? formatDate(searchObject.validity.from)
                    : ""}</td
                >
                <td class="p-4"
                  >{searchObject.validity.to
                    ? formatDate(searchObject.validity.to)
                    : ""}</td
                >
              {:else if header.value === "manager_responsibility"}
                <!-- TODO: Maybe add indication of 'inherited' -->
                <ul>
                  {#if searchObject.responsibilities}
                    {#each searchObject.responsibilities as responsibility}
                      <li>
                        • {responsibility.name}
                      </li>
                    {/each}
                  {/if}
                </ul>
              {:else if header.value === "related_unit"}
                <td class="p-4">{searchObject.org_units[1].name}</td>
                <td class="p-4">{searchObject.org_units[0].name}</td>
              {:else}
                <td class="p-4">
                  {resolveFieldValue(searchObject, header)}
                </td>
              {/if}
            {/each}
          </tr>
        {:else}
          <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
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
