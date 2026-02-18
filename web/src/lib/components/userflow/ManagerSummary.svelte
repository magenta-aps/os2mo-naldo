<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { managerInfo } from "$lib/stores/managerInfoStore"
</script>

<div>
  <h3 class="text-primary">{capital($_("manager", { values: { n: 2 } }))}</h3>
  {#each $managerInfo as manager, index}
    {#if manager.validated === true}
      <div class="grid gap-1 pb-2 text-base-content">
        <h4>
          {capital($_("manager", { values: { n: 1 } }))}
          {index + 1}
        </h4>
        <div class="pb-1">
          <div class="grid grid-cols-2">
            <span>{capital($_("date.start_date"))}:</span>
            <span>{manager.fromDate}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("date.end_date"))}:</span>
            <span>{manager.toDate}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("unit", { values: { n: 1 } }))}:</span>
            <span>{manager.orgUnit?.name}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("manager_type"))}:</span>
            <span>{manager.managerType?.name}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>
              {capital($_("manager_level"))}:
            </span>
            <span>{manager.managerLevel?.name}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("manager_responsibility"))}:</span>
            <ul>
              {#each manager.responsibilities as responsibility}
                <li>
                  • {responsibility.name}
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    {/if}
  {/each}
</div>
