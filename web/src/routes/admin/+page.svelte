<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital, upperCase } from "$lib/util/translationUtils"
  import { base } from "$app/paths"
  import TenseTabs from "$lib/components/shared/TenseTabs.svelte"
  import ClassTable from "$lib/components/tables/ClassTable.svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { GetFacetsDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { date } from "$lib/stores/date"
  import { facetStore } from "$lib/stores/facetStore"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import infoOutlineRounded from "@iconify/icons-material-symbols/info-outline-rounded"

  let facet: { name: string; uuid: string; user_key?: string }
  let facetUuid: string

  gql`
    query GetFacets($fromDate: DateTime!) {
      facets(filter: { from_date: $fromDate }) {
        objects {
          validities {
            uuid
            user_key
          }
        }
      }
    }
  `

  const updateFacet = () => {
    facetUuid = facet.uuid
  }
  onMount(async () => {
    if ($facetStore.uuid) {
      facet = {
        name: $facetStore.name,
        uuid: $facetStore.uuid,
      }
      facetUuid = $facetStore.uuid
    }
  })
</script>

<HeadTitle type="admin" />

<div class="px-12 pt-6">
  <h1 class="mb-4">
    {capital($_("classifications"))}
    <div class="tooltip tooltip-bottom" data-tip={$_("classifications_text")}>
      <Icon class="align-middle" icon={infoOutlineRounded} width="25" height="25" />
    </div>
  </h1>

  {#await graphQLClient().request(GetFacetsDocument, { fromDate: $date })}
    <div class="flex flex-row gap-6">
      <Skeleton extra_classes="basis-1/2" />
    </div>
  {:then data}
    {@const facets = data.facets.objects}
    <div class="flex flex-row gap-6">
      <Select
        title={capital($_("facet", { values: { n: 1 } }))}
        id="facet-uuid"
        bind:value={facet}
        iterable={facets
          .map((e) => ({
            name: capital($_("facets.name." + e.validities[0].user_key)),
            user_key: e.validities[0].user_key,
            uuid: e.validities[0].uuid,
          }))
          .sort((a, b) => (a.name > b.name ? 1 : -1))}
        on:change={() => {
          updateFacet()
        }}
        placeholder={capital(
          $_("select_item", {
            values: { item: $_("facet", { values: { n: 1 } }) },
          })
        )}
        extra_classes="basis-1/4"
      />
    </div>
    {#if facetUuid}
      <p>{$_("facets.description." + facet.user_key)}</p>
    {/if}
    <div class="flex justify-between">
      <TenseTabs />
      {#if facetUuid}
        <Button
          type="button"
          title={capital(
            $_("create_item", {
              values: { item: $_(facet.name, { values: { n: 1 } }) },
            })
          )}
          href="{base}/admin/facet/{facetUuid}/create/class"
          extraClasses="my-5"
        />
      {:else}
        <Button
          type="button"
          title={capital(
            $_("create_item", {
              values: { item: $_("class", { values: { n: 1 } }) },
            })
          )}
          href="{base}/admin/facet/{facetUuid}/create/class"
          extraClasses="my-5"
        />
      {/if}
    </div>
    <TableTensesWrapper
      table={ClassTable}
      headers={[
        { title: capital($_("name")), sortPath: "name" },
        { title: capital($_("user_key")), sortPath: "user_key" },
        { title: capital($_("date.date")), sortPath: "validity.from" },
        { title: "" },
      ]}
      {facetUuid}
    />
  {/await}
</div>
