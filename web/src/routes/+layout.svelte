<script lang="ts">
  import "$lib/global.css"
  import SuccessAlert from "$lib/components/alerts/success.svelte"
  import Navbar from "$lib/components/navbar.svelte"
  import { onMount } from "svelte"
  import Keycloak from "keycloak-js"
  import { initKeycloak } from "$lib/util/keycloak"
  import Favicon from "$lib/assets/favicon.png"
  import Drawer from "$lib/components/drawer.svelte"
  import { isAuth } from "$lib/stores/auth"
  import { env } from "$env/dynamic/public"

  const instance = `${env.PUBLIC_BASE_URL}/service/keycloak.json`

  onMount(async () => {
    // let newKeycloak = new Keycloak(instance)
    // newKeycloak
    //   .init({ onLoad: "login-required" })
    //   .then((authenticated) => {
    //     isAuth.set(true)
    //     console.info("Authenticated:", authenticated)
    //
    //     // Token refresh
    //     setInterval(() => {
    //       newKeycloak.updateToken(15).catch(() => {
    //         console.error("Failed to refresh token")
    //       })
    //     }, 5000)
    //   })
    //   .catch((error) => {
    //     isAuth.set(false)
    //     console.error("Failed to auth:", error)
    //     alert("failed to auth")
    //   })
    // console.log(newKeycloak)
    await initKeycloak()
  })
</script>

<svelte:head>
  <link rel="icon" type="image/png" href={Favicon} />
  <title>OS2mo</title>
</svelte:head>

<div class="flex flex-col h-screen">
  <Navbar />
  <Drawer>
    <slot />
  </Drawer>
</div>

<SuccessAlert />
