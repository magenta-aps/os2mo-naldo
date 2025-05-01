<script lang="ts">
  import { _ } from "svelte-i18n"
  import "$lib/global.css"
  import { base } from "$app/paths"
  import { isAdmin, isAuth } from "$lib/stores/auth"
  import { logoutKeycloak, keycloak } from "$lib/util/keycloak"
  import { MOConfig } from "$lib/stores/config"
  import personAddOutlineRounded from "@iconify/icons-material-symbols/person-add-outline-rounded"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"
  import Icon from "@iconify/svelte"
  import NavbarButton from "$lib/components/navbar/NavbarButton.svelte"
  import swapHorizRounded from "@iconify/icons-material-symbols/swap-horiz-rounded"
  import addCircleOutlineRounded from "@iconify/icons-material-symbols/add-circle-outline-rounded"
  import link from "@iconify/icons-material-symbols/link"
  import personOutlineRounded from "@iconify/icons-material-symbols/person-outline-rounded"
  import { capital } from "$lib/util/translationUtils"
  import { locale } from "svelte-i18n"
  import assignmentOutlineRounded from "@iconify/icons-material-symbols/assignment-outline-rounded"
  import inventory2OutlineRounded from "@iconify/icons-material-symbols/inventory-2-outline-rounded"
  import searchRounded from "@iconify/icons-material-symbols/search-rounded"
  import book2OutlineRounded from "@iconify/icons-material-symbols/book-2-outline-rounded"
  import homeOutlineRounded from "@iconify/icons-material-symbols/home-outline-rounded"
  import codeRounded from "@iconify/icons-material-symbols/code-rounded"
  import language from "@iconify/icons-material-symbols/language"
  import logout from "@iconify/icons-material-symbols/logout-rounded"
  import { env } from "$env/dynamic/public"

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

  let isOpen = true
</script>

<div class="flex flex-col h-full bg-secondary">
  <!-- TODO: Feedback from Carl - Make links into squares (more like mockup) -->
  <!-- Navbar with Icons and Expandable Text -->
  <ul class="menu flex-grow">
    <!-- Navigation Items -->
    <!-- Links -->
    <NavbarButton
      title={capital($_("home"))}
      href="{base}/"
      icon={homeOutlineRounded}
      open={isOpen}
    />
    <NavbarButton
      title={capital($_("report", { values: { n: 2 } }))}
      href="{base}/reports"
      icon={assignmentOutlineRounded}
      open={isOpen}
    />
    {#if $isAdmin}
      {#if env.PUBLIC_SHOW_ADMIN_PANEL !== "false"}
        <NavbarButton
          title={capital($_("classifications"))}
          href="{base}/admin"
          icon={inventory2OutlineRounded}
          open={isOpen}
        />
      {/if}
      {#if env.PUBLIC_SHOW_INSIGHTS !== "false"}
        <NavbarButton
          title={capital($_("insights"))}
          href="{base}/insights"
          icon={searchRounded}
          open={isOpen}
        />
      {/if}
    {/if}

    {#if env.PUBLIC_DOCS_LINK !== "false"}
      <NavbarButton
        title={capital($_("documentation"))}
        href="https://rammearkitektur.docs.magenta.dk/os2mo/home/manual.html"
        icon={book2OutlineRounded}
        open={isOpen}
        external
      />
    {/if}

    <NavbarButton
      title={$_("graphql")}
      href="{env.PUBLIC_BASE_URL}/graphql"
      icon={codeRounded}
      open={isOpen}
      external
    />

    {#if env.PUBLIC_ONBOARDING_LINK === "true"}
      <NavbarButton
        title={capital($_("onboarding"))}
        href="{base}/userflow"
        icon={personAddOutlineRounded}
        open={isOpen}
      />
    {/if}

    {#if $MOConfig && JSON.parse($MOConfig.navlinks).length}
      {@const links = JSON.parse($MOConfig.navlinks)}
      {#each links as link}
        <NavbarButton
          title={link.text}
          href={link.href}
          icon="material-symbols:graph-2"
          open={isOpen}
        />
      {/each}
    {/if}

    <div class="divider divider-accent before:h-[.05rem] after:h-[.05rem] p-0 m-0" />
    <!-- Quick actions -->
    <NavbarButton
      title={$_("navigation.create_employee")}
      href="{base}/employee/create/employee"
      icon={personAddOutlineRounded}
      open={isOpen}
    />
    <NavbarButton
      title={$_("navigation.move_engagements")}
      href="{base}/organisation/move/engagements"
      icon={swapHorizRounded}
      open={isOpen}
    />
    <NavbarButton
      title={$_("navigation.create_unit")}
      href="{base}/organisation/create/unit"
      icon={addCircleOutlineRounded}
      open={isOpen}
    />
    <NavbarButton
      title={$_("navigation.connections")}
      href="{base}/connections"
      icon={link}
      open={isOpen}
    />
  </ul>

  <div class="divider divider-accent before:h-[.05rem] after:h-[.05rem] p-0 m-0" />

  <!-- Bottom Section with Language Switch, Logout, Profile Icon -->
  <!-- <ul class="menu mb-1 p-0"> -->
  <!--   <li> -->
  <!--     <button -->
  <!--       on:click={changeLanguage} -->
  <!--       class="text-white hover:no-underline hover:bg-accent focus:text-white hover:text-secondary" -->
  <!--     > -->
  <!--       <Icon icon={language} width="20" height="20" /> -->
  <!--       <span class={isOpen ? "visible" : "hidden"}> -->
  <!--         {$locale === "en-GB" ? "Dansk" : "English"} -->
  <!--       </span> -->
  <!--     </button> -->
  <!--   </li> -->
  <!---->
  <!--   <!-- Logout Button --> -->
  <!--   <li> -->
  <!--     <button -->
  <!--       on:click={logoutKeycloak} -->
  <!--       class="text-white hover:no-underline hover:bg-accent hover:text-secondary" -->
  <!--     > -->
  <!--       <Icon icon={logout} width="20" height="20" /> -->
  <!--       <span class={isOpen ? "visible" : "hidden"}> -->
  <!--         {capital($_("logout"))} -->
  <!--       </span> -->
  <!--     </button> -->
  <!--   </li> -->
  <!---->
  <!--   <!-- Profile Icon Button --> -->
  <!--   <li> -->
  <!--     <button -->
  <!--       on:click={() => (isOpen = !isOpen)} -->
  <!--       class="text-white hover:no-underline hover:bg-accent hover:text-secondary group" -->
  <!--     > -->
  <!--       <Icon -->
  <!--         icon={personOutlineRounded} -->
  <!--         width="20" -->
  <!--         height="20" -->
  <!--         class="bg-accent text-secondary rounded-full p-1 transition-all group-hover:bg-secondary group-hover:text-accent" -->
  <!--       /> -->
  <!--       <span class="{isOpen ? 'visible' : 'hidden'} font-bold"> -->
  <!--         {fullName()} -->
  <!--       </span> -->
  <!--     </button> -->
  <!--   </li> -->
  <!-- </ul> -->
</div>

<style>
  /* Apparently Firefox and Chrome doesn't show pixels the same way, 
    so this is a workaround to make the divider thin in both browsers.. */

  @supports (-moz-appearance: none) {
    .divider::before,
    .divider::after {
      height: 0.0625rem !important;
    }
  }
</style>
