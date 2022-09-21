<script lang="ts">
  import Search from "$lib/components/search.svelte"
  import { base } from "$app/paths"
  import Avatar from "./navbar/avatar.svelte"
</script>

<div class="navbar bg-secondary text-base-100 shadow-xl">
  <div class="navbar-start">
    <label for="my-drawer-3" class="btn btn-square btn-ghost lg:hidden">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="inline-block w-6 h-6 stroke-current"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        /></svg
      >
    </label>

    <a class="btn btn-ghost normal-case text-xl hover:no-underline" href="{base}/"
      >OS2mo</a
    >
  </div>

  <div class="navbar-center">
    <Search />
  </div>

  <div class="navbar-end">
    <Avatar />
  </div>
</div>
