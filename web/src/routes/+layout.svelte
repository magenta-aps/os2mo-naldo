<script lang="ts">
  import { _ } from "svelte-i18n"
  import "$lib/global.css"
  import { base } from "$app/paths"
  import SuccessAlert from "$lib/components/alerts/Success.svelte"
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
  import { isAuth } from "$lib/stores/auth"
  import { error, success, warning } from "$lib/stores/alert"
  import personAddOutlineRounded from "@iconify/icons-material-symbols/person-add-outline-rounded"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"
  import Icon from "@iconify/svelte"
  import swapHorizRounded from "@iconify/icons-material-symbols/swap-horiz-rounded"
  import addCircleOutlineRounded from "@iconify/icons-material-symbols/add-circle-outline-rounded"
  import link from "@iconify/icons-material-symbols/link"
  import SearchBar from "$lib/components/navbar/SearchBar.svelte"
  import OrgTree from "$lib/components/org/tree/OrgTree.svelte"
  import { capital } from "$lib/util/translationUtils"

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

  let isOpen = false
</script>

<svelte:head>
  <link rel="icon" type="image/png" href={Favicon} />
  <title>OS2mo</title>
</svelte:head>

<div class="flex h-screen">
  <!-- Navbar Container -->
  <div
    class={`flex flex-col h-full bg-secondary transition-all duration-300 ease-in-out ${
      isOpen ? "w-60" : "w-14"
    }`}
  >
    <!-- Navbar with Icons and Expandable Text -->
    <ul class="menu p-0">
      <li class="flex flex-row justify-between items-center h-16">
        {#if isOpen}
          <a href="/" class="text-white text-xl hover:no-underline"> OS2mo </a>
        {/if}
        <button
          on:click={() => (isOpen = !isOpen)}
          class="btn btn-ghost justify-between min-h-16 text-white hover:no-underline text-xl"
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
        <a href="{base}/employee/create/employee" class="text-white hover:no-underline">
          <Icon icon={personAddOutlineRounded} width="20" height="20" />
          {#if isOpen}
            <span class="text-base-100">{$_("navigation.create_employee")}</span>
          {/if}
        </a>
      </li>
      <li>
        <a
          href="{base}/organisation/move/engagements"
          class="text-white hover:no-underline"
        >
          <Icon icon={swapHorizRounded} width="20" height="20" />
          {#if isOpen}
            <span class="text-base-100">{$_("navigation.move_engagements")}</span>
          {/if}
        </a>
      </li>
      <li>
        <a href="{base}/organisation/create/unit" class="text-white hover:no-underline">
          <Icon icon={addCircleOutlineRounded} width="20" height="20" />
          {#if isOpen}
            <span class="text-base-100">{$_("navigation.create_unit")}</span>
          {/if}
        </a>
      </li>
      <li>
        <a href="{base}/connections" class="text-white hover:no-underline">
          <Icon icon={link} width="20" height="20" />
          {#if isOpen}
            <span class="text-base-100">{$_("navigation.connections")}</span>
          {/if}
        </a>
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
