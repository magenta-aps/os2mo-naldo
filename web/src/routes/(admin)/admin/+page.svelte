<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { base } from "$app/paths"
  import TenseTabs from "$lib/components/shared/TenseTabs.svelte"
  import ClassTable from "$lib/components/tables/ClassTable.svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import { date } from "$lib/stores/date"
  import { facetStore } from "$lib/stores/facetStore"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import infoOutlineRounded from "@iconify/icons-material-symbols/info-outline-rounded"
  import listIcon from "@iconify/icons-material-symbols/list-alt-outline-rounded"
  import computerIcon from "@iconify/icons-material-symbols/computer-outline-rounded"
  import { getFacets } from "$lib/http/getFacets"

  // State to track which admin section is active
  let adminSection: "classifications" | "itsystems" = "classifications"

  let facet: { name: string; uuid: string; user_key?: string }
  let facetUuid: string
  let facets: { name: string; uuid: string; user_key?: string }[]

  const updateFacet = () => {
    facetUuid = facet.uuid
  }

  onMount(async () => {
    if ($facetStore.uuid) {
      facet = {
        name: $facetStore.name,
        user_key: $facetStore.name,
        uuid: $facetStore.uuid,
      }
      facetUuid = $facetStore.uuid
    }
    facets = await getFacets({ uuid: null, fromDate: $date })
  })
</script>

<HeadTitle type="admin" />

<div class="flex min-h-screen bg-slate-50">
  <aside class="w-64 bg-slate-800 text-white flex flex-col p-4 shadow-xl">
    <h2
      class="text-xl font-bold mb-8 px-4 text-slate-300 uppercase tracking-wider text-sm"
    >
      {capital($_("administration"))}
    </h2>

    <nav class="flex flex-col gap-2">
      <button
        class="flex items-center gap-3 px-4 py-3 rounded transition-colors {adminSection ===
        'classifications'
          ? 'bg-primary text-white'
          : 'hover:bg-slate-700 text-slate-300'}"
        on:click={() => (adminSection = "classifications")}
      >
        <Icon icon={listIcon} width="20" />
        {capital($_("classifications"))}
      </button>

      <button
        class="flex items-center gap-3 px-4 py-3 rounded transition-colors {adminSection ===
        'itsystems'
          ? 'bg-primary text-white'
          : 'hover:bg-slate-700 text-slate-300'}"
        on:click={() => (adminSection = "itsystems")}
      >
        <Icon icon={computerIcon} width="20" />
        {capital($_("itsystems"))}
      </button>
    </nav>
  </aside>

  <main class="flex-1 p-12 overflow-y-auto">
    {#if adminSection === "classifications"}
      <h1 class="mb-4">
        {capital($_("classifications"))}
        <div class="tooltip tooltip-bottom" data-tip={$_("classifications_text")}>
          <Icon class="align-middle" icon={infoOutlineRounded} width="25" height="25" />
        </div>
      </h1>

      <div class="flex flex-row gap-6 mb-6">
        <Select
          title={capital($_("facet", { values: { n: 1 } }))}
          id="facet-uuid"
          bind:value={facet}
          iterable={facets}
          on:change={updateFacet}
          placeholder={capital(
            $_("select_item", { values: { item: $_("facet", { values: { n: 1 } }) } })
          )}
          extra_classes="basis-1/4"
        />
      </div>

      <div class="flex justify-between items-end mb-4">
        <TenseTabs />
        <Button
          title={capital(
            $_("create_item", { values: { item: facet?.name || $_("class"), n: 1 } })
          )}
          href="{base}/admin/facet/{facetUuid || 'create'}/create/class"
        />
      </div>

      <TableTensesWrapper
        table={ClassTable}
        headers={[
          { title: capital($_("name")), sortPath: "name" },
          { title: capital($_("user_key")), sortPath: "user_key" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
        {facetUuid}
      />
    {:else if adminSection === "itsystems"}
      <h1 class="mb-8">{capital($_("itsystems"))}</h1>

      <div class="flex justify-between items-end mb-4">
        <TenseTabs />
        <Button
          title={capital($_("create_item", { values: { item: $_("itsystem") } }))}
          href="{base}/admin/itsystem/create"
        />
      </div>
    {/if}
  </main>
</div>
