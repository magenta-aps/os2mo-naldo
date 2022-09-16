<script lang="ts">
  import { base } from "$app/paths"

  import OrgTree from "$lib/components/org/tree/org_tree.svelte"
  import { isAuth } from "$lib/stores/auth"
  import Icon from "$lib/components/icon.svelte"
</script>

<ul class="menu p-4 pb-2 overflow-y-auto text-base">
  <!-- Sidebar content here -->
  <li>
    <div class="flex">
      <Icon type="house" />
      <a class="hover:no-underline text-secondary" href="{base}/">Hjem</a>
    </div>
  </li>
  <li>
    <div class="flex">
      <Icon type="user" />
      <a class="hover:no-underline text-secondary" href="{base}/employee"
        >Medarbejdere</a
      >
    </div>
  </li>
  <li>
    <div class="flex">
      <Icon type="sitemap" />
      <!-- FIXME: Doesn't exist yet  -->
      <a class="hover:no-underline text-secondary" href="{base}/"
        >Organisationssammenkobling</a
      >
    </div>
  </li>
</ul>

<div class="divider p-0 m-0 w-full" />

<ul class="menu p-4 overflow-y-auto bg-base-100 text-base-content">
  <p class="font-bold text-secondary pb-4">Organisationsoverblik</p>

  {#if $isAuth}
    <OrgTree />
  {:else}
    <div class="m-auto">
      <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
      <p class="pt-6">Authentication...</p>
    </div>
  {/if}
</ul>
