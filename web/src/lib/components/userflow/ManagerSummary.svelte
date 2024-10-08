<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { managerInfo } from "$lib/stores/managerInfoStore"
</script>

<div>
  <h2 class="pb-2">{capital($_("manager", { values: { n: 1 } }))}</h2>
  <dl class="grid gap-1">
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.start_date"))}:</dt>
      {#if $managerInfo.validated === true}
        <dd>{$managerInfo.fromDate}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.end_date"))}:</dt>
      {#if $managerInfo.validated === true}
        <dd>{$managerInfo.toDate}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("unit", { values: { n: 1 } }))}:</dt>
      {#if $managerInfo.validated === true}
        <dd>{$managerInfo.orgUnit?.name ? $managerInfo.orgUnit.name : ""}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("manager_type"))}:</dt>
      {#if $managerInfo.validated === true}
        <dd>{$managerInfo.managerType.name ? $managerInfo.managerType.name : ""}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("manager_level"))}:</dt>
      {#if $managerInfo.validated === true}
        <dd>{$managerInfo.managerLevel.name ? $managerInfo.managerLevel.name : ""}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("manager_responsibility"))}:</dt>
      {#if $managerInfo.validated === true}
        <dd>
          <ul>
            {#each $managerInfo.responsibilities as responsibility}
              <li>
                • {responsibility.name}
              </li>
            {/each}
          </ul>
        </dd>
      {/if}
    </div>
  </dl>
</div>
