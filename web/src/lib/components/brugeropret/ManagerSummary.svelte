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
      <dd>{$managerInfo.fromDate}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.end_date"))}:</dt>
      <dd>{$managerInfo.toDate}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("unit", { values: { n: 1 } }))}:</dt>
      <dd>{$managerInfo.orgUnit?.name ? $managerInfo.orgUnit.name : ""}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("manager_type"))}:</dt>
      <dd>{$managerInfo.managerType.name ? $managerInfo.managerType.name : ""}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("manager_level"))}:</dt>
      <dd>{$managerInfo.managerLevel.name ? $managerInfo.managerLevel.name : ""}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("manager_responsibility"))}:</dt>
      <dd>
        <ul>
          {#each $managerInfo.responsibilities as responsibility}
            <li>
              • {responsibility.name}
            </li>
          {/each}
        </ul>
      </dd>
    </div>
  </dl>
</div>
