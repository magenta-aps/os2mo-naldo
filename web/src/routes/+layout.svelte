<script lang="ts">
  import { _ } from "svelte-i18n"
  import "$lib/global.css"
  import { base } from "$app/paths"
  import SuccessAlert from "$lib/components/alerts/Success.svelte"
  import { isAdmin, isAuth } from "$lib/stores/auth"
  import { logoutKeycloak, keycloak } from "$lib/util/keycloak"
  import ErrorAlert from "$lib/components/alerts/Error.svelte"
  import WarningAlert from "$lib/components/alerts/Warning.svelte"
  import Navbar from "$lib/components/Navbar.svelte"
  import { onMount } from "svelte"
  import { initKeycloak } from "$lib/util/keycloak"
  import Favicon from "$lib/assets/favicon.png"
  import Drawer from "$lib/components/Drawer.svelte"
  import { MOConfig, formatConfig } from "$lib/stores/config"
  import { gql } from "graphql-request"
  import { GetConfigDocument } from "./query.generated"
  import { graphQLClient } from "$lib/util/http"
  import { error, success, warning } from "$lib/stores/alert"
  import personAddOutlineRounded from "@iconify/icons-material-symbols/person-add-outline-rounded"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"
  import Icon from "@iconify/svelte"
  import swapHorizRounded from "@iconify/icons-material-symbols/swap-horiz-rounded"
  import addCircleOutlineRounded from "@iconify/icons-material-symbols/add-circle-outline-rounded"
  import link from "@iconify/icons-material-symbols/link"
  import SearchBar from "$lib/components/navbar/SearchBar.svelte"
  import personOutlineRounded from "@iconify/icons-material-symbols/person-outline-rounded"
  import OrgTree from "$lib/components/org/tree/OrgTree.svelte"
  import { capital } from "$lib/util/translationUtils"
  import User from "$lib/components/navbar/User.svelte"
  import { locale } from "svelte-i18n"
  import assignmentOutlineRounded from "@iconify/icons-material-symbols/assignment-outline-rounded"
  import inventory2OutlineRounded from "@iconify/icons-material-symbols/inventory-2-outline-rounded"
  import searchRounded from "@iconify/icons-material-symbols/search-rounded"
  import book2OutlineRounded from "@iconify/icons-material-symbols/book-2-outline-rounded"
  import homeOutlineRounded from "@iconify/icons-material-symbols/home-outline-rounded"
  import codeRounded from "@iconify/icons-material-symbols/code-rounded"
  // import graph2 from "@iconify/material-symbols/graph-4"
  import language from "@iconify/icons-material-symbols/language"
  import logout from "@iconify/icons-material-symbols/logout-rounded"
  import { env } from "$env/dynamic/public"

  gql`
    query GetConfig {
      configuration {
        objects {
          key
          jsonified_value
        }
      }
    }
  `

  const getConfig = async () => {
    try {
      const config = await graphQLClient().request(GetConfigDocument)
      return formatConfig(config)
    } catch (err) {
      $error = { message: err }
      return null
    }
  }

  onMount(async () => {
    await initKeycloak()
  })

  // Makes sure keycloak has had a chance to load before fetching the config
  $: if ($isAuth) {
    ;(async () => {
      $MOConfig = await getConfig()
    })()
  }

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

<svelte:head>
  <link rel="icon" type="image/png" href={Favicon} />
  <title>OS2mo</title>
</svelte:head>

<div class="flex h-screen">
  <!-- Navbar Container -->
  <div class="flex flex-col h-full bg-secondary">
    <!-- TODO: Feedback from Carl - Make links into squares (more like mockup) -->
    <!-- Navbar with Icons and Expandable Text -->
    <ul class="menu p-0 flex-grow">
      <!-- Navigation Items -->
      <li class="flex flex-row justify-between items-center h-16">
        {#if isOpen}
          <a href="{base}/" class="text-white text-xl font-bold hover:no-underline"
            >OS2mo</a
          >
        {/if}
        <button
          on:click={() => (isOpen = !isOpen)}
          class="btn btn-ghost justify-between min-h-16 text-white hover:no-underline hover:bg-accent hover:text-secondary text-xl"
        >
          <Icon
            icon={keyboardArrowDownRounded}
            width="20"
            height="20"
            rotate={isOpen ? 1 : 3}
          />
        </button>
      </li>
      <li>
        <a
          href="{base}/"
          class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
        >
          <Icon icon={homeOutlineRounded} width="20" height="20" />
          {#if isOpen}
            <span class="font-bold">{capital($_("home"))}</span>
          {/if}
        </a>
      </li>
      <li>
        <a
          href="{base}/reports"
          class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
        >
          <Icon icon={assignmentOutlineRounded} width="20" height="20" />
          {#if isOpen}
            <span class="font-bold">{capital($_("report", { values: { n: 2 } }))}</span>
          {/if}
        </a>
      </li>

      {#if $isAdmin}
        {#if env.PUBLIC_SHOW_ADMIN_PANEL !== "false"}
          <li>
            <a
              href="{base}/admin"
              class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
            >
              <Icon icon={inventory2OutlineRounded} width="20" height="20" />
              {#if isOpen}
                <span class="font-bold">{capital($_("classifications"))}</span>
              {/if}
            </a>
          </li>
        {/if}
        {#if env.PUBLIC_SHOW_INSIGHTS !== "false"}
          <li>
            <a
              href="{base}/insights"
              class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
            >
              <Icon icon={searchRounded} width="20" height="20" />
              {#if isOpen}
                <span class="font-bold">{capital($_("insights"))}</span>
              {/if}
            </a>
          </li>
        {/if}
      {/if}
      {#if env.PUBLIC_DOCS_LINK !== "false"}
        <li>
          <a
            href="https://rammearkitektur.docs.magenta.dk/os2mo/home/manual.html"
            target="_blank"
            class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
          >
            <Icon icon={book2OutlineRounded} width="20" height="20" />
            {#if isOpen}
              <span class="font-bold">{capital($_("documentation"))}</span>
            {/if}
          </a>
        </li>
      {/if}
      <li>
        <a
          href="{env.PUBLIC_BASE_URL}/graphql"
          target="_blank"
          class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
        >
          <Icon icon={codeRounded} width="20" height="20" />
          {#if isOpen}
            <span class="font-bold">{$_("graphql")}</span>
          {/if}
        </a>
      </li>
      {#if env.PUBLIC_ONBOARDING_LINK === "true"}
        <li>
          <a
            href="{base}/userflow"
            class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
          >
            <Icon icon={personAddOutlineRounded} width="20" height="20" />
            {#if isOpen}
              <span class="font-bold">{capital($_("onboarding"))}</span>
            {/if}
          </a>
        </li>
      {/if}

      {#if $MOConfig && JSON.parse($MOConfig.navlinks).length}
        {@const links = JSON.parse($MOConfig.navlinks)}
        {#each links as link}
          <li>
            <a
              href={link.href}
              class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
            >
              <!-- For some reason graph-2 is not in the module, so have to use it directly.  -->
              <Icon icon="material-symbols:graph-2" width="20" height="20" />
              {#if isOpen}
                <span class="font-bold">{link.text}</span>
              {/if}
            </a>
          </li>
        {/each}
      {/if}

      <div
        class="divider divider-accent before:h-[.025rem] after:h-[.025rem] p-0 m-0"
      />

      <li>
        <a
          href="{base}/employee/create/employee"
          class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
        >
          <Icon icon={personAddOutlineRounded} width="20" height="20" />
          {#if isOpen}
            <span class="font-bold">{$_("navigation.create_employee")}</span>
          {/if}
        </a>
      </li>
      <li>
        <a
          href="{base}/organisation/move/engagements"
          class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
        >
          <Icon icon={swapHorizRounded} width="20" height="20" />
          {#if isOpen}
            <span class="font-bold">{$_("navigation.move_engagements")}</span>
          {/if}
        </a>
      </li>
      <li>
        <a
          href="{base}/organisation/create/unit"
          class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
        >
          <Icon icon={addCircleOutlineRounded} width="20" height="20" />
          {#if isOpen}
            <span class="font-bold">{$_("navigation.create_unit")}</span>
          {/if}
        </a>
      </li>
      <li>
        <a
          href="{base}/connections"
          class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
        >
          <Icon icon={link} width="20" height="20" />
          {#if isOpen}
            <span class="font-bold break-words">{$_("navigation.connections")}</span>
          {/if}
        </a>
      </li>
    </ul>

    <div class="divider divider-accent before:h-[.025rem] after:h-[.025rem] p-0 m-0" />

    <!-- Bottom Section with Language Switch, Logout, Profile Icon -->
    <ul class="menu mb-1 p-0">
      <li>
        <button
          on:click={changeLanguage}
          class="text-white hover:no-underline hover:bg-accent focus:text-white hover:text-secondary"
        >
          <Icon icon={language} width="20" height="20" />
          <span class={isOpen ? "visible" : "hidden"}>
            {$locale === "en-GB" ? "Dansk" : "English"}
          </span>
        </button>
      </li>

      <!-- Logout Button -->
      <li>
        <button
          on:click={logoutKeycloak}
          class="text-white hover:no-underline hover:bg-accent hover:text-secondary"
        >
          <Icon icon={logout} width="20" height="20" />
          <span class={isOpen ? "visible" : "hidden"}>
            {capital($_("logout"))}
          </span>
        </button>
      </li>

      <!-- Profile Icon Button -->
      <li>
        <button
          on:click={() => (isOpen = !isOpen)}
          class="text-white hover:no-underline hover:bg-accent hover:text-secondary group"
        >
          <Icon
            icon={personOutlineRounded}
            width="20"
            height="20"
            class="bg-accent text-secondary rounded-full p-1 transition-all group-hover:bg-secondary group-hover:text-accent"
          />
          <span class="{isOpen ? 'visible' : 'hidden'} font-bold">
            {fullName()}
          </span>
        </button>
      </li>
    </ul>
  </div>
  <div class="flex-col w-full">
    <SearchBar />
    <Drawer>
      <slot />
    </Drawer>
  </div>
</div>

<SuccessAlert />
<!-- TODO: Handle Errors on GraphQL reads better.. -->
<ErrorAlert />
<WarningAlert />
