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
  import { getFacets } from "$lib/http/getFacets"

  let facet: { name: string; uuid: string; user_key: string }
  let facetUuid: string
  let facets: { name: string; uuid: string; user_key: string }[]

  $: isRoleFacet = facet?.user_key === "role"

  const updateFacet = () => {
    facetUuid = facet.uuid
  }

  onMount(async () => {
    if ($facetStore.uuid) {
      facet = {
        name: $facetStore.name,
        user_key: $facetStore.user_key,
        uuid: $facetStore.uuid,
      }
      facetUuid = $facetStore.uuid
    }
    facets = await getFacets({ uuid: null, fromDate: $date })
  })
</script>

<HeadTitle type="admin" />

<div class="flex px-12 pt-6">
  <main class="flex-1">
    <h1 class="pb-4">
      {capital($_("classifications"))}
      <!-- <div class="tooltip tooltip-bottom" data-tip={$_("classifications_text")}> -->
      <!--   <Icon class="align-middle" icon={infoOutlineRounded} width="25" height="25" /> -->
      <!-- </div> -->
    </h1>

    <div class="flex flex-row gap-6">
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

    <div class="flex justify-between">
      <TenseTabs />
      <Button
        title={capital(
          $_("create_item", {
            values: { item: $_("class", { values: { n: 1 } }), n: 1 },
          })
        )}
        href="{base}/admin/facet/{facetUuid ? `${facetUuid}/` : ''}create/class"
        extraClasses="my-5"
      />
    </div>

    <TableTensesWrapper
      table={ClassTable}
      headers={[
        { title: capital($_("name")), sortPath: "name" },
        { title: capital($_("user_key")), sortPath: "user_key" },
        ...(isRoleFacet
          ? [
              {
                title: capital($_("itsystem", { values: { n: 1 } })),
                sortPath: "it_system.name",
              },
            ]
          : []),
        { title: capital($_("date.date")), sortPath: "validity.from" },
      ]}
      {facetUuid}
      {isRoleFacet}
    />
  </main>
</div>
