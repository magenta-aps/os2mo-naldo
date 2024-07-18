<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import OrgTree from "$lib/components/org/tree/OrgTree.svelte"
  import { isAuth } from "$lib/stores/auth"
  import Icon from "@iconify/svelte"
  import closeRounded from "@iconify/icons-material-symbols/close-rounded"
</script>

<ul class="menu pt-6 px-5 overflow-y-auto bg-base-100 text-base-content">
  <!-- Add links -->
  <div class="flex justify-between">
    <h4 class="font-bold text-secondary pb-4">
      {capital($_("organisation_overview"))}
    </h4>

    <label class="lg:hidden" for="drawer">
      <Icon icon={closeRounded} />
    </label>
  </div>

  {#if $isAuth}
    <OrgTree />
  {:else}
    <div role="status" class="max-w-sm animate-pulse">
      <div class="h-12 bg-base-100 rounded dark:bg-accent max-w-[360px] mb-2.5" />
    </div>
  {/if}
  <!-- Add <User /> -->
</ul>
