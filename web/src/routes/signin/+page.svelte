<script lang="ts">
  import { onMount } from "svelte"
  import { signIn } from "@auth/sveltekit/client"

  onMount(async () => {
    await signIn("keycloak", { callbackUrl: "/" })
  })
</script>

<p>Signing in...</p>
