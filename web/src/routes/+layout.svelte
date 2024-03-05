<script lang="ts">
  import { _ } from "svelte-i18n"
  import "$lib/global.css"
  import SuccessAlert from "$lib/components/alerts/success.svelte"
  import Navbar from "$lib/components/navbar.svelte"
  import { onMount } from "svelte"
  import { initKeycloak } from "$lib/util/keycloak"
  import Favicon from "$lib/assets/favicon.png"
  import Drawer from "$lib/components/drawer.svelte"
  import { MOConfig, formatConfig } from "$lib/stores/config"
  import { gql } from "graphql-request"
  import { GetConfigDocument } from "./query.generated"
  import { graphQLClient } from "$lib/util/http"
  import { isAuth } from "$lib/stores/auth"

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
    } catch (error) {
      console.error("Error fetching configuration:", error)
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
