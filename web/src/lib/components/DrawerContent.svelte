<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import OrgTree from "$lib/components/org/tree/OrgTree.svelte"
</script>

<div class="flex flex-col h-full py-2">
  <!-- Scrollable Content -->
  <div class="flex-1 overflow-y-auto xl:overflow-y-hidden pb-10">
    <!-- Adjusted bottom padding -->
    <ul class="menu pt-6 px-5 bg-base-100 text-base-content">
      <h4 class="font-bold text-base-content pb-4">
        {capital($_("organisation_overview"))}
      </h4>
      <OrgTree />
    </ul>
  </div>
</div>
