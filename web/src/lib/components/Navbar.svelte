<script lang="ts">
  import { _ } from "svelte-i18n"
  import { base } from "$app/paths"
  import User from "$lib/components/navbar/User.svelte"
  import NavLinks from "$lib/components/navbar/NavLinks.svelte"
  import SearchBar from "$lib/components/navbar/SearchBar.svelte"
  import Icon from "@iconify/svelte"
  import menuRounded from "@iconify/icons-material-symbols/menu-rounded"
</script>

<div class="navbar bg-secondary">
  <div class="navbar-start text-base-100">
    <label for="drawer" class="btn btn-square btn-ghost xl:hidden">
      <Icon icon={menuRounded} width="25" height="25" />
    </label>

    <a class="btn btn-ghost normal-case text-xl hover:no-underline" href="{base}/"
      >OS2mo</a
    >
    <NavLinks />
  </div>

  <div class="navbar-end flex gap-10">
    <SearchBar />
    <User />
  </div>
</div>
