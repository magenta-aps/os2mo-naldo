<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { rolebindingInfo } from "$lib/stores/rolebindingInfoStore"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
</script>

<div>
  <h3 class="pb-2 text-primary">{capital($_("rolebinding", { values: { n: 1 } }))}</h3>
  <dl class="grid gap-1">
    {#each $rolebindingInfo as rolebinding}
      <div class="grid grid-cols-2">
        <dt>{capital($_("date.start_date"))}:</dt>
        {#if $ituserInfo.validated === true}
          <dd>{rolebinding.fromDate}</dd>
        {/if}
      </div>
      <div class="grid grid-cols-2">
        <dt>{capital($_("date.end_date"))}:</dt>
        {#if $ituserInfo.validated === true}
          <dd>{rolebinding.toDate}</dd>
        {/if}
      </div>
      <div class="grid grid-cols-2">
        <dt>{capital($_("role", { values: { n: 1 } }))}:</dt>
        {#if $ituserInfo.validated === true}
          <dd>{rolebinding.role.name}</dd>
        {/if}
      </div>
    {/each}
  </dl>
</div>
