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
    return "No Auth"
  }

  $: nameBadge = (): string => {
    if (!$isAuth) {
      return ""
    }
    if (keycloak && keycloak.idTokenParsed) {
      let initials =
        (keycloak.idTokenParsed.given_name
          ? keycloak.idTokenParsed.given_name[0]
          : "") +
        (keycloak.idTokenParsed.family_name
          ? keycloak.idTokenParsed.family_name[0]
          : "")
      if (!initials) {
        initials = "??"
      }
      return initials
    }
    return "No Auth"
  }
</script>

<p class="invisible lg:visible text-base-100">{fullName()}</p>
<div class="dropdown dropdown-end z-10">
  <div tabindex="-1" class="btn btn-ghost btn-circle avatar placeholder">
    <div class="bg-accent w-8 rounded-full">
      <span class="text-neutral">{nameBadge()}</span>
    </div>
  </div>
  <ul
    tabindex="-1"
    class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 text-neutral"
  >
    <li>
      <div class="justify-between text-secondary">
        <span>
          {fullName()}
        </span>
        <span class="badge">{nameBadge()}</span>
      </div>
    </li>
    {#if $isAuth && keycloak}
      <li>
        <span
          on:click={logoutKeycloak}
          on:keypress={logoutKeycloak}
          role="button"
          tabindex="0"
          class="text-secondary">Logout</span
        >
      </li>
    {/if}
  </ul>
</div>
