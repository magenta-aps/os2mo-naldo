<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
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
  import Tabs from "$lib/components/shared/tabs.svelte"
  import { MOConfig } from "$lib/stores/config"

  // Tabs
  let items = [
    { label: "unit", value: "unit", n: 1 },
    { label: "address", value: "address", n: 2 },
    { label: "engagement", value: "engagement", n: 2 },
    { label: "association", value: "association", n: 2 },
    { label: "ituser", value: "ituser", n: 2 },
    { label: "role", value: "role", n: 2 },
    { label: "kle", value: "kle", n: 2 },
    { label: "manager", value: "manager", n: 2 },
    { label: "owner", value: "owner", n: 2 },
    { label: "related_unit", value: "related_unit", n: 2 },
  ]

  let uuidFromUrl = $page.params.uuid
  let activeItem = $activeOrgTab
  const tabChange = (e: CustomEvent) => ($activeOrgTab = activeItem = e.detail)

  gql`
    query OrgUnit($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            name
            user_key
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
    <!-- Find activeItem in `items` -->
    <!-- Fallback "" is just to make TypeScript happy - shouldn't ever happen -->
    {@const item = items.find((item) => item.value === activeItem)?.label || ""}

    <div>
      {#if $MOConfig && $MOConfig.confdb_show_user_key === "true"}
        {capital($_("unit_number"))}: {orgUnit.user_key}
      {/if}
      <Breadcrumbs {orgUnit} link={true} />
    </div>
    <div class="flex gap-5">
      <h1 class="pb-4">{orgUnit.name}</h1>
      <CopyToClipboard uuid={orgUnit.uuid} name={orgUnit.name} />
    </div>

    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    <div class="flex justify-between">
      <TenseTabs />
      <!-- Links are different on `org_unit` and `related`-tabs -->
      <a
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5 hover:no-underline"
        href={`${base}/${
          activeItem === OrgTab.ORG_UNIT
            ? `organisation/create#uuid=${$page.params.uuid}`
            : activeItem === OrgTab.RELATED_UNIT
            ? "connecting_organisations"
            : `organisation/${$page.params.uuid}/create/${activeItem}`
        }`}
      >
        {capital(
          $_("create_item", {
            values: { item: $_(item, { values: { n: 1 } }) },
          })
        )}
      </a>
    </div>

    {#if activeItem === OrgTab.ORG_UNIT}
      <TableTensesWrapper
        table={OrgUnitTable}
        headers={[
          { title: capital($_("unit", { values: { n: 1 } })), sortPath: "name" },
          { title: capital($_("org_unit_type")), sortPath: "unit_type.name" },
          { title: capital($_("org_unit_level")), sortPath: "org_unit_level.name" },
          { title: capital($_("parent")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.ADDRESS}
      <TableTensesWrapper
        table={AddressTable}
        headers={[
          { title: capital($_("address_type")), sortPath: "address_type.name" },
          { title: capital($_("address", { values: { n: 1 } })), sortPath: "name" },
          // TODO: Make it possible to sort optional fields maybe? visibility and primary for example
          { title: capital($_("visibility")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.ENGAGEMENT}
      <TableTensesWrapper
        table={EngagementTable}
        headers={[
          { title: capital($_("name")), sortPath: "employee[0].name" },
          {
            title: capital($_("job_function", { values: { n: 1 } })),
            sortPath: "job_function.name",
          },
          { title: capital($_("engagement_type")), sortPath: "engagement_type.name" },
          { title: capital($_("primary")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.ASSOCIATION}
      <TableTensesWrapper
        table={AssociationTable}
        headers={[
          { title: capital($_("name")), sortPath: "employee[0].name" },
          { title: capital($_("association_type")), sortPath: "association_type.name" },
          { title: capital($_("primary")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.IT}
      <TableTensesWrapper
        table={ItUserTable}
        headers={[
          { title: capital($_("it_system")), sortPath: "itsystem.name" },
          { title: capital($_("account_name")), sortPath: "user_key" },
          { title: capital($_("primary")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.ROLE}
      <TableTensesWrapper
        table={RoleTable}
        headers={[
          { title: capital($_("name")), sortPath: "employee[0].name" },
          { title: capital($_("role_type")), sortPath: "role_type.name" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.MANAGER}
      <TableTensesWrapper
        table={ManagerTable}
        headers={[
          { title: capital($_("name")), sortPath: "employee[0].name" },
          { title: capital($_("manager_responsibility")) },
          { title: capital($_("manager_type")), sortPath: "manager_type.name" },
          { title: capital($_("manager_level")), sortPath: "manager_level.name" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.KLE}
      <TableTensesWrapper
        table={KleTable}
        headers={[
          { title: capital($_("kle_aspect")), sortPath: "kle_aspects[0].name" },
          { title: capital($_("kle_number")), sortPath: "kle_number.name" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.OWNER}
      <TableTensesWrapper
        table={OwnerTable}
        headers={[
          { title: capital($_("name")), sortPath: "person[0].name" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.RELATED_UNIT}
      <TableTensesWrapper
        table={RelatedUnitsTable}
        onlyPresent={true}
        headers={[
          { title: capital($_("related_unit", { values: { n: 1 } })) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
        ]}
      />
    {/if}
  {/await}
</div>
