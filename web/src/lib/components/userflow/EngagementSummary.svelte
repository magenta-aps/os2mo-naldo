<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { env } from "$env/dynamic/public"
</script>

<div>
  <h3 class="pb-2 text-primary">{capital($_("engagement", { values: { n: 1 } }))}</h3>
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
      <dt>
        {env.PUBLIC_SHOW_EXTENSION_1 === "true"
          ? capital($_("job_code"))
          : capital($_("job_function", { values: { n: 1 } }))}:
      </dt>
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
