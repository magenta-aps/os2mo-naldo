<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { isAuth } from "$lib/stores/auth"
  import { logoutKeycloak, keycloak } from "$lib/util/keycloak"
  import Icon from "@iconify/svelte"
  import { locale } from "svelte-i18n"
  import personOutlineRounded from "@iconify/icons-material-symbols/person-outline-rounded"
  import language from "@iconify/icons-material-symbols/language"

  $: fullName = (): string => {
    if (!$isAuth) {
      return `${capital($_("loading"))}...`
    }
    if (keycloak && keycloak.idTokenParsed) {
      return keycloak.idTokenParsed.preferred_username
    }
    return "No Auth"
  }
  const changeLanguage = (event: any) => {
    if ($locale === "da-DA") {
      locale.set("en-GB")
    } else {
      locale.set("da-DA")
    }
  }
</script>

<div class="dropdown dropdown-end z-10 hidden lg:inline-block">
  <div tabindex="-1" class="btn btn-ghost flex">
    <div class="join gap-2">
      <p class="invisible lg:visible text-base-100 self-center">{fullName()}</p>
      <div class="bg-accent rounded-full p-1">
        <Icon icon={personOutlineRounded} width="25" height="25" />
      </div>
    </div>
  </div>
  <ul
    tabindex="-1"
    class="menu menu-compact shadow dropdown-content mt-3 p-2 bg-base-100 rounded w-52"
  >
    <li>
      <div
        on:click={changeLanguage}
        on:keypress={changeLanguage}
        role="button"
        tabindex="0"
        class="justify-between"
      >
        <span class="text-secondary">{$locale === "en-GB" ? "Dansk" : "English"} </span>
        <Icon class="text-secondary" icon={language} width="20" height="20" />
      </div>
    </li>
    <li>
      <span
        on:click={logoutKeycloak}
        on:keypress={logoutKeycloak}
        role="button"
        tabindex="0"
        class="text-secondary">{capital($_("logout"))}</span
      >
    </li>
  </ul>
</div>
