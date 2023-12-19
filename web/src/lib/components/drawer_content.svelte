<script lang="ts">
  import OrgTree from "$lib/components/org/tree/org_tree.svelte"
  import { isAuth } from "$lib/stores/auth"
  import { _ } from "svelte-i18n"
</script>

<ul class="menu pt-6 px-4 overflow-y-auto bg-base-100 text-base-content">
  <p class="font-bold text-secondary pb-4">
    {$_("organization_overview")}
  </p>

  {#if $isAuth}
    <OrgTree />
  {:else}
    <div role="status" class="max-w-sm animate-pulse">
      <div class="h-12 bg-base-100 rounded dark:bg-accent max-w-[360px] mb-2.5" />
    </div>
  {/if}
</ul>
