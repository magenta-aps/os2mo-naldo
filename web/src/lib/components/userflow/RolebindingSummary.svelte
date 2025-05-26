<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
</script>

<div>
  <h3 class="pb-2 text-primary">{capital($_("rolebinding", { values: { n: 2 } }))}</h3>
  <dl class="grid gap-1">
    {#each $ituserInfo as ituser}
      {#each ituser.rolebindings as rolebinding}
        <div class="grid grid-cols-2">
          {#if rolebinding.validated === true}
            <dt>{capital($_("role", { values: { n: 1 } }))}:</dt>
            <dd>{rolebinding.role.name}</dd>
          {/if}
        </div>
      {/each}
    {/each}
  </dl>
</div>
