<script lang="ts">
  import { _ } from "svelte-i18n"
  import "$lib/global.css"
  import SuccessAlert from "$lib/components/alerts/Success.svelte"
  import { isAuth } from "$lib/stores/auth"
  import ErrorAlert from "$lib/components/alerts/Error.svelte"
  import WarningAlert from "$lib/components/alerts/Warning.svelte"
  import Navbar from "$lib/components/navbar/Navbar.svelte"
  import { onMount } from "svelte"
  import { initKeycloak } from "$lib/util/keycloak"
  import Favicon from "$lib/assets/favicon.png"
  import Drawer from "$lib/components/Drawer.svelte"
  import { MOConfig, formatConfig } from "$lib/stores/config"
  import { gql } from "graphql-request"
  import { GetConfigDocument } from "./query.generated"
  import { graphQLClient } from "$lib/util/http"
  import { error } from "$lib/stores/alert"
  import SearchBar from "$lib/components/navbar/SearchBar.svelte"

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
</script>

<svelte:head>
  <link rel="icon" type="image/png" href={Favicon} />
  <title>OS2mo</title>
</svelte:head>

<div class="flex h-screen">
  <Navbar />
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
