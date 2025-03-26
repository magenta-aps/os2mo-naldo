<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import OrgTree from "$lib/components/org/tree/OrgTree.svelte"
  import { isAuth, isAdmin } from "$lib/stores/auth"
  import { base } from "$app/paths"
  import { env } from "$env/dynamic/public"
  import Icon from "@iconify/svelte"
  import { logoutKeycloak, keycloak } from "$lib/util/keycloak"
  import { locale } from "svelte-i18n"
  import personOutlineRounded from "@iconify/icons-material-symbols/person-outline-rounded"
  import language from "@iconify/icons-material-symbols/language"
  import closeRounded from "@iconify/icons-material-symbols/close-rounded"
  import { MOConfig } from "$lib/stores/config"
</script>

<div class="flex flex-col h-full py-2">
  <!-- Scrollable Content -->
  <div class="flex-1 overflow-y-auto xl:overflow-y-hidden pb-10">
    <!-- Adjusted bottom padding -->
    <ul class="menu pt-6 px-5 bg-base-100 text-base-content">
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
  </div>
</div>
