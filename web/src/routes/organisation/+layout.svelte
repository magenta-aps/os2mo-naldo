<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import OrgNavbar from "$lib/components/org/org_navbar.svelte"
</script>

<OrgNavbar />
<slot />
