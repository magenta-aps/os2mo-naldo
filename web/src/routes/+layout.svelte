<script lang="ts">
  import "$lib/global.css"
  import SuccessAlert from "$lib/components/alerts/success.svelte"
  import Navbar from "$lib/components/navbar.svelte"
  import { onMount } from "svelte"
  import { initKeycloak } from "$lib/util/keycloak"
  import Favicon from "$lib/assets/favicon.png"
  import Drawer from "$lib/components/drawer.svelte"
  import { browser } from "$app/environment"
  import "$lib/i18n" // Import to initialize. Important :)
  import { locale, waitLocale } from "svelte-i18n"
  import type { LayoutData } from "./$types"

  export const load: LayoutData = async () => {
    if (browser) {
      locale.set(window.navigator.language)
    }
    await waitLocale()
  }

  onMount(async () => {
    await initKeycloak()
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
