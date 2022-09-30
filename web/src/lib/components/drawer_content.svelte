<script lang="ts">
  import { base } from "$app/paths"
  import OrgTree from "$lib/components/org/tree/org_tree.svelte"
  import { isAuth } from "$lib/stores/auth"
  import Icon from "$lib/components/icon.svelte"
</script>

<ul class="menu p-4 pb-2 overflow-y-auto text-base">
  <!-- Sidebar content here -->
  <li>
    <a class="flex hover:no-underline" href="{base}/">
      <Icon type="house" />
      <div class=" text-secondary">Hjem</div>
    </a>
  </li>
  <li>
    <a class="flex hover:no-underline" href="{base}/employee">
      <Icon type="user" />
      <div class="text-secondary">Medarbejdere</div>
    </a>
  </li>
  <li>
    <a class="flex hover:no-underline" href="{base}/">
      <Icon type="sitemap" />
      <!-- FIXME: Doesn't exist yet  -->
      <div class="text-secondary">Organisationssammenkobling</div>
    </a>
  </li>
</ul>

<div class="divider p-0 m-0 w-full" />

<ul class="menu p-4 overflow-y-auto bg-base-100 text-base-content">
  <p class="font-bold text-secondary pb-4">Organisationsoverblik</p>

  {#if $isAuth}
    <OrgTree />
  {:else}
    <div role="status" class="max-w-sm animate-pulse">
      <div class="h-12 bg-base-100 rounded dark:bg-accent max-w-[360px] mb-2.5" />
    </div>
  {/if}
</ul>
