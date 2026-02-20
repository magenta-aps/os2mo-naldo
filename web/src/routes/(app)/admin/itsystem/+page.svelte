<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { base } from "$app/paths"
  import TenseTabs from "$lib/components/shared/TenseTabs.svelte"
  import ITSystemTable from "$lib/components/tables/ITSystemTable.svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import Icon from "@iconify/svelte"
  import infoOutlineRounded from "@iconify/icons-material-symbols/info-outline-rounded"
</script>

<HeadTitle type="admin" />

<div class="flex px-12 pt-6">
  <main class="flex-1">
    <h1 class="pb-4">
      {capital($_("itsystem", { values: { n: 2 } }))}
      <!-- <div class="tooltip tooltip-bottom" data-tip={$_("classifications_text")}> -->
      <!--   <Icon class="align-middle" icon={infoOutlineRounded} width="25" height="25" /> -->
      <!-- </div> -->
    </h1>

    <div class="flex justify-between">
      <TenseTabs />
      <Button
        title={capital(
          $_("create_item", {
            values: { item: $_("itsystem", { values: { n: 1 } }), n: 1 },
          })
        )}
        href="{base}/admin/itsystem/create"
        extraClasses="my-5"
      />
    </div>

    <TableTensesWrapper
      table={ITSystemTable}
      headers={[
        { title: capital($_("name")), sortPath: "name" },
        { title: capital($_("user_key")), sortPath: "user_key" },
        { title: capital($_("date.date")), sortPath: "validity.from" },
        { title: "" },
        { title: "" },
      ]}
    />
  </main>
</div>
