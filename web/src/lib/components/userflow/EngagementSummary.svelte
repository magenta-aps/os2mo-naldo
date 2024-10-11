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
      {#if $engagementInfo.validated === true}
        <dd>{$engagementInfo.fromDate}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.end_date"))}:</dt>
      {#if $engagementInfo.validated === true}
        <dd>{$engagementInfo.toDate}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("unit", { values: { n: 1 } }))}:</dt>
      {#if $engagementInfo.validated === true}
        <dd>{$engagementInfo.orgUnit?.name}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("id", { values: { n: 2 } }))}:</dt>
      {#if $engagementInfo.validated === true}
        <dd>{$engagementInfo.userkey ? $engagementInfo.userkey : ""}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("job_function", { values: { n: 1 } }))}:</dt>
      {#if $engagementInfo.validated === true}
        <dd>{$engagementInfo.jobFunction.name}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("engagement_type", { values: { n: 1 } }))}:</dt>
      {#if $engagementInfo.validated === true}
        <dd>{$engagementInfo.engagementType.name}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("primary", { values: { n: 1 } }))}:</dt>
      {#if $engagementInfo.validated === true}
        <dd>{$engagementInfo.primary ? $engagementInfo.primary.name : ""}</dd>
      {/if}
    </div>
  </dl>
</div>
