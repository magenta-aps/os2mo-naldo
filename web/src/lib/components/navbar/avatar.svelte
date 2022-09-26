<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import { logoutKeycloak, keycloak } from "$lib/util/keycloak"

  $: fullName = (): string => {
    if (!$isAuth) {
      return "Loading..."
    }
    if (keycloak && keycloak.idTokenParsed) {
      return keycloak.idTokenParsed.name
    }
    return "Ghost user"
  }

  $: nameBadge = (): string => {
    if (!$isAuth) {
      return ""
    }
    if (keycloak && keycloak.idTokenParsed) {
      return (
        keycloak.idTokenParsed.given_name[0] + keycloak.idTokenParsed.family_name[0]
      )
    }
    return "??"
  }
</script>

<p class="text-base-100">{fullName()}</p>
<div class="dropdown dropdown-end">
  <div tabindex="0" class="btn btn-ghost btn-circle avatar placeholder">
    <div class="bg-accent w-8 rounded-full">
      <span class="text-neutral">{nameBadge()}</span>
    </div>
  </div>
  <ul
    tabindex="0"
    class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 text-neutral"
  >
    <li>
      <div class="justify-between">
        <p>
          {fullName()}
        </p>
        <span class="badge">{nameBadge()}</span>
      </div>
    </li>
    {#if $isAuth && keycloak}
      <li><div on:click={logoutKeycloak}>Logout</div></li>
    {/if}
  </ul>
</div>
