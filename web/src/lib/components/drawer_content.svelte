<script lang="ts">
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import OrgTree from "$lib/components/org/tree/org_tree.svelte"
  import { isAuth } from "$lib/stores/auth"
  import Icon from "$lib/components/icon.svelte"

  enum SubPath {
    HOME = "/",
    EMPLOYEE = "/employee",
    ORGANISATION = "/organisation",
    CONNECTING_ORGANISATIONS = "/connecting_organisations",
  }
</script>

<ul class="menu p-2 pb-2 overflow-y-auto text-base">
  <!-- Sidebar content here -->
  <li>
    <a
      class="flex text-secondary hover:no-underline h-10 {$page.url.pathname ===
      SubPath.HOME
        ? 'bg-accent'
        : ''}"
      href="{base}{SubPath.HOME}"
    >
      <Icon type="house" />
      <p>Hjem</p>
    </a>
  </li>
  <li>
    <a
      class="flex text-secondary hover:no-underline h-10 {$page.url.pathname ===
      SubPath.EMPLOYEE
        ? 'bg-accent'
        : ''}"
      href="{base}{SubPath.EMPLOYEE}"
    >
      <Icon type="user" />
      <p>Medarbejdere</p>
    </a>
  </li>
  <li>
    <a
      class="flex text-secondary hover:no-underline h-10 {$page.url.pathname ===
      SubPath.ORGANISATION
        ? 'bg-accent'
        : ''}"
      href="{base}{SubPath.ORGANISATION}"
    >
      <Icon type="users" />
      <p>Organisation</p>
    </a>
  </li>
  <li>
    <a
      class="flex text-secondary hover:no-underline h-10 {$page.url.pathname ===
      SubPath.CONNECTING_ORGANISATIONS
        ? 'bg-accent'
        : ''}"
      href="{base}{SubPath.CONNECTING_ORGANISATIONS}"
    >
      <Icon type="sitemap" />
      <p>Organisationssammenkobling</p>
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
