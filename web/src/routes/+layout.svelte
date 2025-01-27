<script lang="ts">
  import { _ } from "svelte-i18n"
  import "$lib/global.css"
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

<Navbar />
<Drawer>
  <slot />
</Drawer>

<SuccessAlert />
<!-- TODO: Handle Errors on GraphQL reads better.. -->
<ErrorAlert />
<WarningAlert />
