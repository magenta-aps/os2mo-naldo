<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
</script>

<div>
  <h2 class="pb-2">{capital($_("engagement", { values: { n: 1 } }))}</h2>
  <dl class="grid gap-1">
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.start_date"))}:</dt>
      <dd>{$engagementInfo.fromDate}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.end_date"))}:</dt>
      <dd>{$engagementInfo.toDate}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("unit", { values: { n: 1 } }))}:</dt>
      <dd>{$engagementInfo.orgUnit?.name}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("id", { values: { n: 2 } }))}:</dt>
      <dd>{$engagementInfo.userkey ? $engagementInfo.userkey : ""}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("job_function", { values: { n: 1 } }))}:</dt>
      <dd>{$engagementInfo.jobFunction.name}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("engagement_type", { values: { n: 1 } }))}:</dt>
      <dd>{$engagementInfo.engagementType.name}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("primary", { values: { n: 1 } }))}:</dt>
      <dd>{$engagementInfo.primary ? $engagementInfo.primary : ""}</dd>
    </div>
  </dl>
</div>
