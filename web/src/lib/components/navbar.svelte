<script lang="ts">
  import { logoutKeycloak, keycloak } from "$lib/util/keycloak"
  import { isAuth } from "$lib/stores/auth"
  import Search from "$lib/components/search.svelte"

  const fullName = (): string => {
    if (keycloak && keycloak.idTokenParsed) {
      return keycloak.idTokenParsed.name
    }
    return "Ghost user"
  }

  const nameBadge = (): string => {
    if (keycloak && keycloak.idTokenParsed) {
      return (
        keycloak.idTokenParsed.given_name[0] + keycloak.idTokenParsed.family_name[0]
      )
    }
    return "??"
  }
</script>

<div class="navbar bg-secondary text-base-100 shadow-xl">
  <div class="flex-none lg:hidden">
    <label for="my-drawer-3" class="btn btn-square btn-ghost">
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
  </div>

  <div class="flex-1 z-10">
    <div class="flex-none">
      <a class="btn btn-ghost normal-case text-xl" href="/">OS2mo</a>
    </div>
    <div class="mx-auto">
      <Search />
    </div>
  </div>

  <div class="flex-none">
    {#if $isAuth}
      <p>{fullName()}</p>
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar placeholder">
          <div class="bg-accent w-8 rounded-full">
            <span class="text-neutral">{nameBadge()}</span>
          </div>
        </label>
        <ul
          tabindex="0"
          class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 text-neutral"
        >
          <li>
            <div class="justify-between">
              {fullName()}
              <span class="badge">{nameBadge()}</span>
            </div>
          </li>
          {#if keycloak}
            <li><div on:click={logoutKeycloak}>Logout</div></li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
</div>
