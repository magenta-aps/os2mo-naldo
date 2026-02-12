<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { env } from "$lib/env"
</script>

<div>
  <h3 class="text-primary">{capital($_("engagement", { values: { n: 2 } }))}</h3>
  {#each $engagementInfo as engagement, index}
    {#if engagement.validated === true}
      <div class="grid gap-1 pb-2 text-base-content">
        <h4>
          {capital($_("engagement", { values: { n: 1 } }))}
          {index + 1}
        </h4>
        <div class="pb-1">
          <div class="grid grid-cols-2">
            <span>{capital($_("date.start_date"))}:</span>
            <span>{engagement.fromDate}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("date.end_date"))}:</span>
            <span>{engagement.toDate}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("unit", { values: { n: 1 } }))}:</span>
            <span>{engagement.orgUnit?.name}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>
              {env.PUBLIC_SHOW_EXTENSION_1
                ? capital($_("job_code"))
                : capital($_("job_function", { values: { n: 1 } }))}:
            </span>
            <span>{engagement.jobFunction?.name}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>
              {capital($_("engagement_type", { values: { n: 1 } }))}:
            </span>
            <span>{engagement.engagementType?.name}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("id"))}:</span>
            <span>{engagement.userkey ? engagement.userkey : ""}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("primary"))}:</span>
            <span>{engagement.primary ? engagement.primary.name : ""}</span>
          </div>
        </div>
      </div>
    {/if}
  {/each}
</div>
