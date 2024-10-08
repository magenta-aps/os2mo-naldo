<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
</script>

<div>
  <h2 class="pb-2">{capital($_("ituser", { values: { n: 1 } }))}</h2>
  <dl class="grid gap-1">
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.start_date"))}:</dt>
      {#if $ituserInfo.validated === true}
        <dd>{$ituserInfo.fromDate}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.end_date"))}:</dt>
      {#if $ituserInfo.validated === true}
        <dd>{$ituserInfo.toDate}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("itsystem"))}:</dt>
      {#if $ituserInfo.validated === true}
        <dd>{$ituserInfo.itSystem.name}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("account_name"))}:</dt>
      {#if $ituserInfo.validated === true}
        <dd>{$ituserInfo.userkey}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("primary"))}:</dt>
      {#if $ituserInfo.validated === true}
        <dd>{$ituserInfo.primary ? $ituserInfo.primary : ""}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("notes"))}:</dt>
      {#if $ituserInfo.validated === true}
        <dd>{$ituserInfo.notes ? $ituserInfo.notes : ""}</dd>
      {/if}
    </div>
  </dl>
</div>
