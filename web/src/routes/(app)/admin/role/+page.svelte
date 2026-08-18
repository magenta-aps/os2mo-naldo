<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { base } from "$app/paths"
  import TenseTabs from "$lib/components/shared/TenseTabs.svelte"
  import RoleTable from "$lib/components/tables/RoleTable.svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import { date } from "$lib/stores/date"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { GetItSystemsDocument } from "./query.generated"
  import { formatITSystemNames, type ITSystem } from "$lib/utils/helpers"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import infoOutlineRounded from "@iconify/icons-material-symbols/info-outline-rounded"

  gql`
    query GetITSystems($fromDate: DateTime!) {
      itsystems {
        objects {
          current(at: $fromDate) {
            name
            uuid
            user_key
          }
        }
      }
    }
  `

  let itSystem: { name: string; uuid: string } | undefined
  let itSystemUuid: string | undefined
  let itSystems: ITSystem[] | undefined

  const updateITSystem = () => {
    itSystemUuid = itSystem?.uuid
  }
  const clearITSystem = () => {
    itSystemUuid = undefined
  }

  $: createHref = `${base}/admin/role/create${
    itSystemUuid ? `?itsystem=${itSystemUuid}` : ""
  }`

  onMount(async () => {
    const res = await graphQLClient().request(GetItSystemsDocument, { fromDate: $date })
    itSystems = res.itsystems.objects
  })
</script>

<HeadTitle type="admin" />

<div class="flex px-12 pt-6">
  <main class="flex-1">
    <h1 class="pb-4">
      {capital($_("role", { values: { n: 2 } }))}
      <div class="tooltip tooltip-bottom" data-tip={$_("roles_text")}>
        <Icon class="align-middle" icon={infoOutlineRounded} width="25" height="25" />
      </div>
    </h1>

    <div class="flex flex-row gap-6">
      <Select
        title={capital($_("itsystem", { values: { n: 1 } }))}
        id="itsystem-uuid"
        bind:value={itSystem}
        iterable={itSystems ? formatITSystemNames(itSystems) : undefined}
        on:change={updateITSystem}
        on:clear={clearITSystem}
        isClearable={true}
        placeholder={capital(
          $_("select_item", { values: { item: $_("itsystem", { values: { n: 1 } }) } })
        )}
        extra_classes="basis-1/4"
      />
    </div>

    <div class="flex justify-between">
      <TenseTabs />
      <Button
        title={capital(
          $_("create_item", {
            values: { item: $_("role", { values: { n: 1 } }), n: 1 },
          })
        )}
        href={createHref}
        extraClasses="my-5"
      />
    </div>

    <TableTensesWrapper
      table={RoleTable}
      headers={[
        { title: capital($_("name")), sortPath: "name" },
        { title: capital($_("user_key")), sortPath: "user_key" },
        { title: capital($_("date.date")), sortPath: "validity.from" },
      ]}
      props={{ itSystemUuid }}
    />
  </main>
</div>
