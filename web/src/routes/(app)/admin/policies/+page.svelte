<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { base } from "$app/paths"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import PoliciesTable from "$lib/components/tables/PoliciesTable.svelte"
  import TenseTabs from "$lib/components/shared/TenseTabs.svelte"
  import Button from "$lib/components/shared/Button.svelte"
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

    <div class="flex justify-between">
      <TenseTabs />
      <Button
        title={capital(
          $_("create_item", {
            values: { item: $_("policies", { values: { n: 1 } }), n: 1 },
          })
        )}
        href="{base}/admin/policies/create"
        extraClasses="my-5"
      />
    </div>

    <PoliciesTable />
  </main>
</div>
