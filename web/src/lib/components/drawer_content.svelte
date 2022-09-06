<script lang="ts">
  import OrgTree from "$lib/components/org/tree/org_tree.svelte"
  import { isAuth } from "$lib/stores/auth"
</script>

<ul class="menu p-4 overflow-y-auto bg-base-300 text-base-content">
  <!-- Sidebar content here -->
  <li class="mb-2"><a href="/employee">Medarbejdere</a></li>

  <div class="divider" />

  {#if $isAuth}
    <OrgTree />
  {:else}
    <div class="m-auto">
      <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
      <p class="pt-6">Authentication...</p>
    </div>
  {/if}
</ul>
