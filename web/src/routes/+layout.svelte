<script lang="ts">
  import "$lib/global.css"
  import SuccessAlert from "$lib/components/alerts/success.svelte"
  import Navbar from "$lib/components/navbar.svelte"
  import { onMount } from "svelte"
  import { initKeycloak } from "$lib/util/keycloak"
  import Favicon from "$lib/assets/favicon.png"
  import Drawer from "$lib/components/drawer.svelte"

  onMount(async () => {
    await initKeycloak()
  })
</script>

<svelte:head>
  <link rel="icon" type="image/png" href={Favicon} />
  <!-- <title>OS2mo</title> -->
</svelte:head>

<div class="flex flex-col h-screen">
  <Navbar />
  <Drawer>
    <slot />
  </Drawer>
</div>

<SuccessAlert />
