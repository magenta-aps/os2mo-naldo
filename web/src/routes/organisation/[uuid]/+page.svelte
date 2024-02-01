<script lang="ts">
  import { page } from "$app/stores"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import CopyToClipboard from "$lib/components/copy_to_clipboard.svelte"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import { OrgTab, activeOrgTab } from "$lib/stores/tab"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { env } from "$env/dynamic/public"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitDocument } from "./query.generated"
  import { onMount } from "svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
  import EngagementTable from "$lib/components/tables/EngagementTable.svelte"
  import ItUserTable from "$lib/components/tables/ITUserTable.svelte"
  import AddressTable from "$lib/components/tables/AddressTable.svelte"
  import AssociationTable from "$lib/components/tables/AssociationTable.svelte"
  import RoleTable from "$lib/components/tables/RoleTable.svelte"
  import ManagerTable from "$lib/components/tables/ManagerTable.svelte"
  import OrgUnitTable from "$lib/components/tables/OrgUnitTable.svelte"
  import KleTable from "$lib/components/tables/KLETable.svelte"
  import OwnerTable from "$lib/components/tables/OwnerTable.svelte"
  import RelatedUnitsTable from "$lib/components/tables/RelatedUnitsTable.svelte"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import { _ } from "svelte-i18n"
  import Tabs from "$lib/components/shared/tabs.svelte"

  // Tabs
  let items = [
    { label: $_("unit"), value: "org_unit" },
    { label: $_("address"), value: "address" },
    { label: $_("engagement"), value: "engagement" },
    { label: $_("association"), value: "association" },
    { label: $_("it"), value: "it" },
    { label: $_("role"), value: "role" },
    { label: $_("kle"), value: "kle" },
    { label: $_("manager"), value: "manager" },
    { label: $_("related_unit"), value: "related_unit" },
  ]

  // TODO: Move tab logic into tabs.svelte
  if (env.PUBLIC_SHOW_KLE_TAB === "false") {
    items = items.filter((tab) => tab.value !== OrgTab.KLE)
  }

  let uuidFromUrl = $page.params.uuid
  let activeItem = $activeOrgTab
  const tabChange = (e: CustomEvent) => ($activeOrgTab = activeItem = e.detail)

  gql`
    query OrgUnit($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            name
            uuid
          }
        }
      }
    }
  `
  onMount(() => {
    // Will show up as #Tab&MaybeOtherStuff&Ect...
    // In dev SvelteKit will add things like &state=<uuid>
    if ($page.url.hash) {
      // The replace is to solve encoding issues with the 'æ' in KLE-opmærkninger
      const firstHash = $page.url.hash.slice(1).split("&")[0].replace("%C3%A6", "æ")
      if (Object.values(OrgTab).some((v) => v === firstHash)) {
        // Safe to assume the hash is an OrgTab
        $activeOrgTab = activeItem = firstHash as OrgTab
      }
    }
  })

  // Prevents the #await from re-fetching when the tabs changes the hash in the URL
  $: if (uuidFromUrl !== $page.params.uuid) {
    uuidFromUrl = $page.params.uuid
  }
</script>

<HeadTitle type="organisation" />

<div class="px-12 pt-6">
  {#await graphQLClient().request( OrgUnitDocument, { uuid: uuidFromUrl, fromDate: $date } )}
    <p>Loader organisation...</p>
  {:then data}
    {@const orgUnit = data.org_units.objects[0].objects[0]}

    <Breadcrumbs {orgUnit} link={true} />
    <div class="flex gap-5">
      <h1 class="pb-4">{orgUnit.name}</h1>
      <CopyToClipboard uuid={orgUnit.uuid} name={orgUnit.name} />
    </div>

    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    <div class="flex justify-between">
      <TenseTabs />
      <!-- Links are different on `org_unit` and `related`-tabs -->
      <a
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
        href={`${base}/${
          activeItem === OrgTab.ORG_UNIT
            ? `organisation/create#uuid=${$page.params.uuid}`
            : activeItem === OrgTab.RELATED_UNIT
            ? "connecting_organisations"
            : `organisation/${$page.params.uuid}/create/${activeItem}`
        }`}
      >
        {$_("add")}
        {items.find((item) => item.value === activeItem)?.label}
      </a>
    </div>

    {#if activeItem === OrgTab.ORG_UNIT}
      <TableTensesWrapper
        table={OrgUnitTable}
        headers={[
          { title: "Enhed", sortPath: "name" },
          { title: "Enhedstype", sortPath: "unit_type.name" },
          { title: "Enhedsniveau", sortPath: "org_unit_level.name" },
          { title: "Overenhed" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.ADDRESS}
      <TableTensesWrapper
        table={AddressTable}
        headers={[
          { title: "Adressetype", sortPath: "address_type.name" },
          { title: "Adresse", sortPath: "name" },
          // TODO: Make it possible to sort optional fields maybe? visibility and primary for example
          { title: "Synlighed" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.ENGAGEMENT}
      <TableTensesWrapper
        table={EngagementTable}
        headers={[
          { title: "Navn", sortPath: "employee[0].name" },
          { title: "Stillingsbetegnelse", sortPath: "job_function.name" },
          { title: "Engagementstype", sortPath: "engagement_type.name" },
          { title: "Primær" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.ASSOCIATION}
      <TableTensesWrapper
        table={AssociationTable}
        headers={[
          { title: "Navn", sortPath: "employee[0].name" },
          { title: "Tilknytningsrolle", sortPath: "association_type.name" },
          { title: "Primær" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.IT}
      <TableTensesWrapper
        table={ItUserTable}
        headers={[
          { title: "IT system", sortPath: "itsystem.name" },
          { title: "Kontonavn", sortPath: "user_key" },
          { title: "Primær" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.ROLE}
      <TableTensesWrapper
        table={RoleTable}
        headers={[
          { title: "Navn", sortPath: "employee[0].name" },
          { title: "Rolletype", sortPath: "role_type.name" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.MANAGER}
      <TableTensesWrapper
        table={ManagerTable}
        headers={[
          { title: "Navn", sortPath: "employee[0].name" },
          { title: "Lederansvar" },
          { title: "Ledertype", sortPath: "manager_type.name" },
          { title: "Lederniveau", sortPath: "manager_level.name" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.KLE}
      <TableTensesWrapper
        table={KleTable}
        headers={[
          { title: "KLE aspekt", sortPath: "kle_aspects[0].name" },
          { title: "KLE nummer", sortPath: "kle_number.name" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.OWNER}
      <TableTensesWrapper
        table={OwnerTable}
        headers={[
          { title: "Navn", sortPath: "person[0].name" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.RELATED_UNIT}
      <TableTensesWrapper
        table={RelatedUnitsTable}
        onlyPresent={true}
        headers={[
          { title: "Relateret enhed" },
          { title: "Dato", sortPath: "validity.from" },
        ]}
      />
    {/if}
  {/await}
</div>
