<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
</script>

<div>
  <h3 class="pb-2 text-primary">{capital($_("ituser", { values: { n: 1 } }))}</h3>
  <dl class="grid gap-1">
    {#each $ituserInfo as ituser}
      <div class="grid grid-cols-2">
        <dt>{capital($_("date.start_date"))}:</dt>
        {#if ituser.validated === true}
          <dd>{ituser.fromDate}</dd>
        {/if}
      </div>
      <div class="grid grid-cols-2">
        <dt>{capital($_("date.end_date"))}:</dt>
        {#if ituser.validated === true}
          <dd>{ituser.toDate}</dd>
        {/if}
      </div>
      <div class="grid grid-cols-2">
        <dt>{capital($_("itsystem"))}:</dt>
        {#if ituser.validated === true}
          <dd>{ituser.itSystem.name}</dd>
        {/if}
      </div>
      <div class="grid grid-cols-2">
        <dt>{capital($_("account_name"))}:</dt>
        {#if ituser.validated === true}
          <dd>{ituser.userkey}</dd>
        {/if}
      </div>
      <div class="grid grid-cols-2">
        <dt>{capital($_("primary"))}:</dt>
        {#if ituser.validated === true}
          <dd>{ituser.primary ? ituser.primary.name : ""}</dd>
        {/if}
      </div>
      <div class="grid grid-cols-2">
        <dt>{capital($_("notes"))}:</dt>
        {#if ituser.validated === true}
          <dd>{ituser.notes ? ituser.notes : ""}</dd>
        {/if}
      </div>
    {/each}
  </dl>
</div>
