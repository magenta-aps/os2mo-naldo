<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Icon from "@iconify/svelte"
  import infoOutlineRounded from "@iconify/icons-material-symbols/info-outline-rounded"
</script>

<span
  class="text-error inline-flex items-center gap-1"
  title={capital($_("missing_data"))}
>
  — <Icon icon={infoOutlineRounded} width="15" height="15" />
</span>
