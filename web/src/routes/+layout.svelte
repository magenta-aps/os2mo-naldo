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

  async function getConfig() {
    try {
      const config = await graphQLClient().request(GetConfigDocument)
      return formatConfig(config)
    } catch (error) {
      console.error("Error fetching configuration:", error)
      return {}
    }
  }

  onMount(async () => {
    await initKeycloak()
    // Will run into race conditions if store is not
    // retrieved inside an onMount, when used elsewhere
    $MOConfig = await getConfig()
  })
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
