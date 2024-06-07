<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import OrgTree from "$lib/components/org/tree/OrgTree.svelte"
  import { isAuth } from "$lib/stores/auth"
</script>

<ul class="menu pt-6 px-5 overflow-y-auto bg-base-100 text-base-content">
  <h4 class="font-bold text-secondary pb-4">
    {capital($_("organisation_overview"))}
  </h4>

  {#if $isAuth}
    <OrgTree />
  {:else}
    <div role="status" class="max-w-sm animate-pulse">
      <div class="h-12 bg-base-100 rounded dark:bg-accent max-w-[360px] mb-2.5" />
    </div>
  {/if}
</ul>
