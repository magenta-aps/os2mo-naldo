<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import OrgTree from "$lib/components/org/tree/OrgTree.svelte"
  import { isAuth, isAdmin } from "$lib/stores/auth"
  import { base } from "$app/paths"
  import { env } from "$env/dynamic/public"
  import Icon from "@iconify/svelte"
  import { logoutKeycloak, keycloak } from "$lib/util/keycloak"
  import { locale } from "svelte-i18n"
  import personOutlineRounded from "@iconify/icons-material-symbols/person-outline-rounded"
  import language from "@iconify/icons-material-symbols/language"
  import closeRounded from "@iconify/icons-material-symbols/close-rounded"
  import { MOConfig } from "$lib/stores/config"

  // TODO: Clean up duplicated code
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

<div class="flex flex-col h-screen xl:h-full py-2">
  <!-- Header -->
  <div class="flex justify-between pt-6 px-5 xl:hidden">
    <h3 class="font-bold text-primary pb-4">OS2mo</h3>
    <label class="xl:hidden" for="drawer">
      <Icon icon={closeRounded} class="text-primary cursor-pointer" />
    </label>
  </div>

  <!-- Scrollable Content -->
  <div class="flex-1 overflow-y-auto xl:overflow-y-hidden pb-40">
    <!-- Adjusted bottom padding -->
    <ul class="menu pt-6 px-5 bg-base-100 xl:hidden">
      <h4 class="font-bold text-secondary pb-4">
        {capital($_("link", { values: { n: 2 } }))}
      </h4>
      <li>
        <a class="w-100 text-secondary hover:no-underline" href="{base}/reports">
          {capital($_("report", { values: { n: 2 } }))}
        </a>
      </li>
      {#if $isAdmin}
        {#if env.PUBLIC_SHOW_ADMIN_PANEL !== "false"}
          <li>
            <a class="w-100 text-secondary hover:no-underline" href="{base}/admin">
              {capital($_("classifications"))}
            </a>
          </li>
        {/if}
        {#if env.PUBLIC_SHOW_INSIGHTS !== "false"}
          <li>
            <a class="w-100 text-secondary hover:no-underline" href="{base}/insights">
              {capital($_("insights"))}
            </a>
          </li>
        {/if}
      {/if}
      <!-- Show by default -->
      {#if env.PUBLIC_DOCS_LINK !== "false"}
        <li>
          <a
            class="w-100 text-secondary hover:no-underline"
            href="https://rammearkitektur.docs.magenta.dk/os2mo/home/manual.html"
            target="_blank">{capital($_("documentation"))}</a
          >
        </li>
      {/if}
      <!-- Don't show by default -->
      {#if env.PUBLIC_ONBOARDING_LINK === "true"}
        <li>
          <a class="w-100 text-secondary hover:no-underline" href="{base}/userflow">
            {capital($_("onboarding"))}</a
          >
        </li>
      {/if}
      {#if $MOConfig && JSON.parse($MOConfig.navlinks).length}
        {@const links = JSON.parse($MOConfig.navlinks)}
        {#each links as link}
          <li>
            <a class="w-100 text-secondary hover:no-underline" href={link.href}>
              {link.text}
            </a>
          </li>
        {/each}
      {/if}
    </ul>

    <ul class="menu pt-6 px-5 bg-base-100 text-base-content">
      <h4 class="font-bold text-secondary pb-4">
        {capital($_("organisation_overview"))}
      </h4>
      {#if $isAuth}
        <OrgTree />
      {:else}
        <div role="status" class="max-w-sm animate-pulse">
          <div class="h-12 bg-base-100 rounded dark:bg-accent max-w-[360px] mb-2.5" />
        </div>
      {/if}
    </ul>
  </div>

  <!-- Footer -->
  <div class="fixed bottom-0 left-0 w-full bg-base-200 text-white p-4 xl:hidden">
    <div class="join gap-2 text-secondary">
      <div class="bg-accent rounded-full p-1">
        <Icon icon={personOutlineRounded} width="25" height="25" />
      </div>
      <p class="font-bold self-center">{fullName()}</p>
    </div>
    <ul tabindex="-1" class="menu rounded w-52">
      <li>
        <div
          on:click={changeLanguage}
          on:keypress={changeLanguage}
          role="button"
          tabindex="0"
          class="justify-between"
        >
          <span class="text-secondary">{$locale === "en-GB" ? "Dansk" : "English"}</span
          >
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
</div>
