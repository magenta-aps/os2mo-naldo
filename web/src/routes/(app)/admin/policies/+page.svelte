<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import Icon from "@iconify/svelte"
  import infoOutlineRounded from "@iconify/icons-material-symbols/info-outline-rounded"
</script>

<HeadTitle type="admin" />

<div class="flex px-12 pt-6">
  <main class="flex-1">
    <h1 class="pb-4">
      {capital($_("policies", { values: { n: 2 } }))}
      <div class="tooltip tooltip-bottom" data-tip={$_("policies_text")}>
        <Icon class="align-middle" icon={infoOutlineRounded} width="25" height="25" />
      </div>
    </h1>
  </main>
</div>
