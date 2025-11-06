<script lang="ts">
  import { _ } from "svelte-i18n"
  import "$lib/global.css"
  import { base } from "$app/paths"
  import { isAdmin, isAuth } from "$lib/stores/auth"
  import { logoutKeycloak, keycloak } from "$lib/auth/keycloak"
  import { MOConfig } from "$lib/stores/config"
  import personAddOutlineRounded from "@iconify/icons-material-symbols/person-add-outline-rounded"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"
  import Icon from "@iconify/svelte"
  import NavbarButton from "$lib/components/navbar/NavbarButton.svelte"
  import swapHorizRounded from "@iconify/icons-material-symbols/swap-horiz-rounded"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { VersionDocument } from "./query.generated"
  import badgeOutlineRounded from "@iconify/icons-material-symbols/badge-outline-rounded"
  import addCircleOutlineRounded from "@iconify/icons-material-symbols/add-circle-outline-rounded"
  import link from "@iconify/icons-material-symbols/link"
  import personOutlineRounded from "@iconify/icons-material-symbols/person-outline-rounded"
  import { capital } from "$lib/utils/helpers"
  import { locale } from "svelte-i18n"
  import assignmentOutlineRounded from "@iconify/icons-material-symbols/assignment-outline-rounded"
  import inventory2OutlineRounded from "@iconify/icons-material-symbols/inventory-2-outline-rounded"
  import searchRounded from "@iconify/icons-material-symbols/search-rounded"
  import book2OutlineRounded from "@iconify/icons-material-symbols/book-2-outline-rounded"
  import homeOutlineRounded from "@iconify/icons-material-symbols/home-outline-rounded"
  import codeRounded from "@iconify/icons-material-symbols/code-rounded"
  import language from "@iconify/icons-material-symbols/language"
  import logout from "@iconify/icons-material-symbols/logout-rounded"
  import { env } from "$lib/env"

  gql`
    query Version {
      version {
        mo_version
      }
    }
  `

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

  let isOpen = false
</script>

<div class="flex h-screen sticky top-0">
  <div class="flex flex-col bg-secondary">
    <ul class="menu">
      <li class="flex flex-row justify-between h-16">
        {#if isOpen}
          {#if $isAuth}
            {#await graphQLClient().request(VersionDocument)}
              <a href="{base}/" class="text-white text-xl font-bold hover:no-underline">
                OS2mo
              </a>
            {:then data}
              <a
                title={`OS2mo version: ${data.version.mo_version} 
OS2mo-frontend version: ${env.PUBLIC_COMMIT_TAG}`}
                href="{base}/"
                class="text-white text-xl font-bold hover:no-underline"
              >
                OS2mo
              </a>
            {/await}
          {/if}
        {/if}
        <button
          type="button"
          class="btn btn-square btn-secondary text-start text-white hover:bg-accent hover:text-secondary"
          on:click={() => (isOpen = !isOpen)}
        >
          <Icon
            icon={keyboardArrowDownRounded}
            width="20"
            height="20"
            rotate={isOpen ? 1 : 3}
          />
        </button>
      </li>
      <!-- Navigation Items -->
      <NavbarButton
        title={capital($_("home"))}
        href="{base}/"
        icon={homeOutlineRounded}
        open={isOpen}
      />

      {#if env.PUBLIC_ONBOARDING_LINK}
        <NavbarButton
          title={capital($_("onboarding"))}
          href="{base}/userflow"
          icon={badgeOutlineRounded}
          open={isOpen}
        />
      {/if}
      {#if $isAdmin}
        {#if env.PUBLIC_SHOW_ADMIN_PANEL}
          <NavbarButton
            title={capital($_("classifications"))}
            href="{base}/admin"
            icon={inventory2OutlineRounded}
            open={isOpen}
          />
        {/if}
        {#if env.PUBLIC_SHOW_INSIGHTS}
          <NavbarButton
            title={capital($_("insights"))}
            href="{base}/insights"
            icon={searchRounded}
            open={isOpen}
          />
        {/if}
      {/if}
      <NavbarButton
        title={capital($_("report", { values: { n: 2 } }))}
        href="{base}/reports"
        icon={assignmentOutlineRounded}
        open={isOpen}
      />

      {#if $MOConfig && JSON.parse($MOConfig.navlinks).length}
        {@const links = JSON.parse($MOConfig.navlinks)}
        {#each links as link}
          <NavbarButton
            title={link.text}
            href={link.href}
            icon="material-symbols:graph-2"
            open={isOpen}
            external
          />
        {/each}
      {/if}

      {#if env.PUBLIC_DOCS_LINK}
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
    </ul>

    <div class="divider divider-accent before:h-[.05rem] after:h-[.05rem] p-0 m-0" />

    <ul class="menu grow">
      <!-- Quick actions -->
      <NavbarButton
        title={$_("navigation.create_employee")}
        href="{base}/employee/create/employee"
        icon={personAddOutlineRounded}
        open={isOpen}
      />
      <NavbarButton
        title={$_("navigation.create_unit")}
        href="{base}/organisation/create/unit"
        icon={addCircleOutlineRounded}
        open={isOpen}
      />
      <NavbarButton
        title={$_("navigation.move_engagements")}
        href="{base}/organisation/move/engagements"
        icon={swapHorizRounded}
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

    <ul class="menu">
      <li class="flex">
        <button
          type="button"
          class="btn btn-secondary flex-nowrap text-white hover:no-underline hover:bg-accent focus:text-white hover:text-secondary group {isOpen
            ? 'justify-start'
            : 'btn-square'}"
          on:click={() => (isOpen = !isOpen)}
        >
          <Icon
            icon={personOutlineRounded}
            class="bg-accent text-secondary rounded-full p-1 transition-all group-hover:bg-secondary group-hover:text-accent"
            width="20"
            height="20"
          />

          {#if isOpen}
            <span class="nowrap">
              {fullName()}
            </span>
          {/if}
        </button>
      </li>
      <li>
        <button
          type="button"
          class="btn btn-secondary text-white hover:no-underline hover:bg-accent focus:text-white hover:text-secondary {isOpen
            ? 'justify-start'
            : 'btn-square'}"
          on:click={changeLanguage}
        >
          <Icon icon={language} width="20" height="20" />

          {#if isOpen}
            <span class="nowrap">
              {$locale === "en-GB" ? "Dansk" : "English"}
            </span>
          {/if}
        </button>
      </li>
      <li>
        <button
          type="button"
          class="btn btn-secondary text-white hover:no-underline hover:bg-accent focus:text-white hover:text-secondary {isOpen
            ? 'justify-start'
            : 'btn-square'}"
          on:click={logoutKeycloak}
        >
          <Icon icon={logout} width="20" height="20" />

          {#if isOpen}
            <span class="nowrap">
              {capital($_("logout"))}
            </span>
          {/if}
        </button>
      </li>
    </ul>
  </div>
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
