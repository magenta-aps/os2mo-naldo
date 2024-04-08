<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import OrgNavbar from "$lib/components/org/OrgNavbar.svelte"
</script>

<OrgNavbar />
<slot />
