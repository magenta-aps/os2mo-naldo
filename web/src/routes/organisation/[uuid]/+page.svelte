<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital, upperCase } from "$lib/util/translationUtils"
  import { page } from "$app/stores"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import CopyToClipboard from "$lib/components/Clipboard.svelte"
  import TenseTabs from "$lib/components/shared/TenseTabs.svelte"
  import { ItTab, OrgTab, activeItTab, activeOrgTab } from "$lib/stores/tab"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitDocument, type OrgUnitQuery } from "./query.generated"
  import { onMount } from "svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
  import EngagementTable from "$lib/components/tables/EngagementTable.svelte"
  import OrgItUserTable from "$lib/components/tables/OrgITUserTable.svelte"
  import AddressTable from "$lib/components/tables/AddressTable.svelte"
  import AssociationTable from "$lib/components/tables/AssociationTable.svelte"
  import ManagerTable from "$lib/components/tables/ManagerTable.svelte"
  import OrgUnitTable from "$lib/components/tables/OrgUnitTable.svelte"
  import KleTable from "$lib/components/tables/KLETable.svelte"
  import OwnerTable from "$lib/components/tables/OwnerTable.svelte"
  import RoleBindingTable from "$lib/components/tables/RoleBindingTable.svelte"
  import RelatedUnitsTable from "$lib/components/tables/RelatedUnitsTable.svelte"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Tabs from "$lib/components/shared/Tabs.svelte"
  import { MOConfig } from "$lib/stores/config"
  import { tenseFilter } from "$lib/util/helpers"
  import { env } from "$env/dynamic/public"

  // Tabs
  let items = [
    { label: "unit", value: "unit", n: 1 },
    { label: "address", value: "address", n: 2 },
    { label: "engagement", value: "engagement", n: 2 },
    { label: "association", value: "association", n: 2 },
    { label: "ituser", value: "ituser", n: 2 },
    { label: "kle", value: "kle", n: 2 },
    { label: "manager", value: "manager", n: 2 },
    { label: "owner", value: "owner", n: 2 },
    { label: "related_unit", value: "related_unit", n: 2 },
  ]

  let itItems = [
    { label: "ituser", value: "ituser", n: 2 },
    { label: "rolebinding", value: "rolebinding", n: 2 },
  ]

  let uuidFromUrl = $page.params.uuid
  let activeItem = $activeOrgTab
  const tabChange = (e: CustomEvent) => ($activeOrgTab = activeItem = e.detail)

  let itActiveItem = $activeItTab
  const itTabChange = (e: CustomEvent) => {
    $activeItTab = itActiveItem = e.detail
  }

  gql`
    query OrgUnit($uuid: [UUID!]) {
      org_units(filter: { uuids: $uuid, from_date: null, to_date: null }) {
        objects {
          validities {
            name
            user_key
            uuid
            validity {
              from
              to
            }
          }
        }
      }
    }
  `

  const fetchRelevantOrg = async (uuid: string, globalDate: string) => {
    const res = await graphQLClient().request(OrgUnitDocument, {
      uuid: uuid,
    })

    let orgUnits: OrgUnitQuery["org_units"]["objects"][0]["validities"] = []

    for (const outer of res.org_units.objects) {
      // Look for present
      orgUnits = outer.validities.filter((obj) => {
        const fromDate = obj.validity.from.split("T")[0]
        const toDate = obj.validity.to?.split("T")[0]
        return globalDate >= fromDate && (!toDate || globalDate <= toDate)
      })
      if (orgUnits.length > 0) break

      // Look for past
      orgUnits = outer.validities.filter((obj) => {
        return tenseFilter(obj, "past")
      })
      if (orgUnits.length) break

      // Look for future
      orgUnits = outer.validities.filter((obj) => {
        return tenseFilter(obj, "future")
      })
    }
    return orgUnits[0]
  }
  onMount(async () => {
    // Will show up as #Tab&MaybeOtherStuff&Ect...
    // In dev SvelteKit will add things like &state=<uuid>
    if ($page.url.hash) {
      // The replace is to solve encoding issues with the 'æ' in KLE-opmærkninger
      const firstHash = $page.url.hash.slice(1).split("&")[0].replace("%C3%A6", "æ")
      if (Object.values(OrgTab).some((v) => v === firstHash)) {
        if (firstHash === ItTab.ROLEBINDING) {
          // Since rolebinding is not an EmployeeTab, we need to make sure we go to EmployeeTab.IT
          // and also change activeItTab to rolebinding/it
          $activeOrgTab = activeItem = OrgTab.IT as OrgTab
          $activeItTab = itActiveItem = firstHash as ItTab
        } else {
          // Safe to assume the hash is an OrgTab
          $activeOrgTab = activeItem = firstHash as OrgTab
        }
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
  {#await fetchRelevantOrg(uuidFromUrl, $date)}
    <p>Loader organisation...</p>
  {:then orgUnit}
    <!-- Find activeItem in `items`
    Fallback "" is just to make TypeScript happy - shouldn't ever happen -->
    {@const item = items.find((item) => item.value === activeItem)?.label || ""}

    <div class="flex gap-5">
      <h1 class="pb-4">{orgUnit.name}</h1>
      <CopyToClipboard uuid={orgUnit.uuid} name={orgUnit.name} />
    </div>
    <div class="pb-4">
      <Breadcrumbs {orgUnit} link={true} />
      {#if $MOConfig && $MOConfig.confdb_show_user_key === "true"}
        <p class="text-sm">{capital($_("unit_number"))}: {orgUnit.user_key}</p>
      {/if}
    </div>
    <Tabs {activeItem} {items} on:tabChange={tabChange} />
    <div class="flex justify-between">
      <TenseTabs />
      {#if activeItem === OrgTab.IT}
        <a
          class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5 hover:no-underline"
          href={`${base}/organisation/${$page.params.uuid}/create/${itActiveItem}`}
        >
          {capital(
            $_("create_item", {
              values: { item: $_(itActiveItem, { values: { n: 1 } }) },
            })
          )}
        </a>
      {:else}
        <!-- Links are different on `org_unit` and `related`-tabs -->
        <a
          class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5 hover:no-underline"
          href={`${base}/${
            activeItem === OrgTab.RELATED_UNIT
              ? "connections"
              : `organisation/${$page.params.uuid}/create/${activeItem}`
          }`}
        >
          {capital(
            $_("create_item", {
              values: { item: $_(activeItem, { values: { n: 1 } }) },
            })
          )}
        </a>
      {/if}
    </div>
  {/await}
  {#key $date + uuidFromUrl}
    {#if activeItem === OrgTab.ORG_UNIT}
      <TableTensesWrapper
        table={OrgUnitTable}
        headers={[
          { title: capital($_("unit", { values: { n: 1 } })), sortPath: "name" },
          { title: capital($_("org_unit_type")), sortPath: "unit_type.name" },
          { title: capital($_("org_unit_level")), sortPath: "org_unit_level.name" },
          { title: capital($_("parent")) },
          { title: capital($_("time_planning")), sortPath: "time_planning.name" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.ADDRESS}
      <TableTensesWrapper
        table={AddressTable}
        headers={[
          { title: capital($_("address_type")), sortPath: "address_type.name" },
          { title: capital($_("description")) },
          { title: capital($_("address", { values: { n: 1 } })), sortPath: "name" },
          // TODO: Make it possible to sort optional fields maybe? visibility and primary for example
          { title: capital($_("visibility")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
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
            title: upperCase($_("id")),
            sortPath: "user_key",
          },
          {
            title:
              env.PUBLIC_SHOW_EXTENSION_1 === "true"
                ? capital($_("job_code"))
                : capital($_("job_function", { values: { n: 1 } })),
            sortPath: "job_function.name",
          },
          {
            title: capital($_("job_function", { values: { n: 1 } })),
            sortPath: "job_function.name",
          },
          { title: capital($_("engagement_type")), sortPath: "engagement_type.name" },
          { title: capital($_("primary")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
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
          { title: capital($_("substitute")), sortPath: "substitute[0].name" },
          { title: capital($_("trade_union")) },
          { title: capital($_("primary")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.IT}
      <Tabs
        activeItem={itActiveItem}
        items={itItems}
        on:tabChange={itTabChange}
        extra_classes="mb-2"
      />
      {#if itActiveItem === ItTab.IT}
        <TableTensesWrapper
          table={OrgItUserTable}
          headers={[
            { title: capital($_("it_system")), sortPath: "itsystem.name" },
            { title: capital($_("account_name")), sortPath: "user_key" },
            { title: capital($_("primary")) },
            { title: capital($_("date.date")), sortPath: "validity.from" },
            { title: "" },
            { title: "" },
            { title: "" },
          ]}
        />
      {:else if itActiveItem === ItTab.ROLEBINDING}
        <TableTensesWrapper
          table={RoleBindingTable}
          headers={[
            {
              title: capital($_("ituser", { values: { n: 1 } })),
              sortPath: "ituser[0].user_key",
            },
            {
              title: capital($_("itsystem", { values: { n: 1 } })),
              sortPath: "ituser[0].itsystem.name",
            },
            {
              title: capital($_("role", { values: { n: 1 } })),
              sortPath: "role[0].name",
            },
            { title: capital($_("date.date")), sortPath: "validity.from" },
            { title: "" },
            { title: "" },
            { title: "" },
          ]}
        />
      {/if}
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
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.KLE}
      <TableTensesWrapper
        table={KleTable}
        headers={[
          { title: capital($_("kle_aspect")), sortPath: "kle_aspects[0].name" },
          { title: capital($_("kle_number")), sortPath: "kle_number.user_key" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.OWNER}
      <TableTensesWrapper
        table={OwnerTable}
        headers={[
          { title: capital($_("name")), sortPath: "owner[0].name" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === OrgTab.RELATED_UNIT}
      <TableTensesWrapper
        table={RelatedUnitsTable}
        headers={[
          {
            title: capital($_("related_unit", { values: { n: 1 } })),
            sortPath: "org_units[0].name",
          },
          { title: capital($_("date.date")), sortPath: "validity.from" },
        ]}
      />
    {/if}
  {/key}
</div>
