<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import { EmployeeTab, activeEmployeeTab } from "$lib/stores/tab"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { EmployeeDocument } from "./query.generated"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import { env } from "$env/dynamic/public"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { onMount } from "svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
  import EngagementTable from "$lib/components/tables/EngagementTable.svelte"
  import ItUserTable from "$lib/components/tables/ITUserTable.svelte"
  import AddressTable from "$lib/components/tables/AddressTable.svelte"
  import AssociationTable from "$lib/components/tables/AssociationTable.svelte"
  import EmployeeTable from "$lib/components/tables/EmployeeTable.svelte"
  import ItAssociationTable from "$lib/components/tables/ITAssociationTable.svelte"
  import RoleTable from "$lib/components/tables/RoleTable.svelte"
  import ManagerTable from "$lib/components/tables/ManagerTable.svelte"
  import LeaveTable from "$lib/components/tables/LeaveTable.svelte"
  import OwnerTable from "$lib/components/tables/OwnerTable.svelte"
  import { MOConfig } from "$lib/stores/config"

  // Tabs
  // "n" used for deciding which translation to use in Tabs
  let items = [
    { label: "employee", value: "employee", n: 1 },
    { label: "engagement", value: "engagement", n: 2 },
    { label: "address", value: "address", n: 2 },
    { label: "association", value: "association", n: 2 },
    { label: "itassociation", value: "itassociation", n: 2 },
    { label: "role", value: "role", n: 2 },
    { label: "ituser", value: "ituser", n: 2 },
    { label: "leave", value: "leave", n: 2 },
    { label: "manager", value: "manager", n: 2 },
    { label: "owner", value: "owner", n: 2 },
  ]

  let uuidFromUrl = $page.params.uuid

  let activeItem = $activeEmployeeTab
  const tabChange = (e: CustomEvent) => ($activeEmployeeTab = activeItem = e.detail)

  gql`
    query Employee($uuid: [UUID!], $fromDate: DateTime) {
      employees(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            name
            cpr_number
          }
        }
      }
    }
  `

  onMount(() => {
    // Will show up as #Tab&MaybeOtherStuff&Ect...
    // In dev SvelteKit will add things like &state=<uuid>
    if ($page.url.hash) {
      const firstHash = $page.url.hash.slice(1).split("&")[0]
      if (Object.values(EmployeeTab).some((v) => v === firstHash)) {
        // Safe to assume the hash is an EmployeeTab
        $activeEmployeeTab = activeItem = firstHash as EmployeeTab
      }
    }
  })

  // Prevents the #await from re-fetching when the tabs changes the hash in the URL
  $: if (uuidFromUrl !== $page.params.uuid) {
    uuidFromUrl = $page.params.uuid
  }
</script>

<HeadTitle type="employee" />

<div class="px-12 pt-6">
  {#await graphQLClient().request( EmployeeDocument, { uuid: uuidFromUrl, fromDate: $date } )}
    <p>
      {capital($_("loading"))}
      {$_("employee", { values: { n: 1 } })}...
    </p>
  {:then data}
    {@const employee = data.employees.objects[0].objects[0]}
    <!-- Find activeItem in `items` -->
    <!-- Fallback "" is just to make TypeScript happy - shouldn't ever happen -->
    {@const item = items.find((item) => item.value === activeItem)?.label || ""}
    <h1 class="mb-4">
      {employee.name}
      {#if $MOConfig.confdb_show_cpr_no === "true"}
        <span class="text-slate-600">
          {employee.cpr_number
            ? `(${employee.cpr_number.slice(0, 6)}-${employee.cpr_number.slice(-4)})`
            : ""}
        </span>
      {/if}
    </h1>

    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    <div class="flex justify-between">
      <TenseTabs />
      <a
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5 hover:no-underline"
        href={`${base}/employee/${
          activeItem === EmployeeTab.EMPLOYEE
            ? "create"
            : `${$page.params.uuid}/create/${activeItem}`
        }`}
      >
        {capital(
          $_("create_item", {
            values: { item: $_(item, { values: { n: 1 } }) },
          })
        )}
      </a>
    </div>

    {#if activeItem === EmployeeTab.EMPLOYEE}
      <TableTensesWrapper
        table={EmployeeTable}
        headers={[
          { title: capital($_("name")), sortPath: "name" },
          { title: capital($_("nickname")), sortPath: "nickname" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ENGAGEMENT}
      <TableTensesWrapper
        table={EngagementTable}
        headers={[
          {
            title: capital($_("unit", { values: { n: 1 } })),
            sortPath: "org_unit[0].name",
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
        ]}
      />
    {:else if activeItem === EmployeeTab.ADDRESS}
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
    {:else if activeItem === EmployeeTab.ASSOCIATION}
      <TableTensesWrapper
        table={AssociationTable}
        headers={[
          {
            title: capital($_("unit", { values: { n: 1 } })),
            sortPath: "org_unit[0].name",
          },
          { title: capital($_("association_type")), sortPath: "association_type.name" },
          { title: capital($_("primary")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ITASSOCIATION}
      <TableTensesWrapper
        table={ItAssociationTable}
        headers={[
          {
            title: capital($_("unit", { values: { n: 1 } })),
            sortPath: "org_unit[0].name",
          },
          {
            title: capital($_("job_function", { values: { n: 1 } })),
            sortPath: "job_function.name",
          },
          { title: capital($_("it_system")), sortPath: "it_user[0].itsystem.name" },
          { title: capital($_("account_name")), sortPath: "it_user[0].user_key" },
          { title: capital($_("primary")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ROLE}
      <TableTensesWrapper
        table={RoleTable}
        headers={[
          {
            title: capital($_("unit", { values: { n: 1 } })),
            sortPath: "org_unit[0].name",
          },
          { title: capital($_("role_type")), sortPath: "role_type.name" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.IT}
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
    {:else if activeItem === EmployeeTab.LEAVE}
      <TableTensesWrapper
        table={LeaveTable}
        headers={[
          { title: capital($_("leave_type")), sortPath: "leave_type.name" },
          {
            title: capital($_("engagement", { values: { n: 1 } })),
            sortPath: "engagement.job_function.name",
          },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.MANAGER}
      <TableTensesWrapper
        table={ManagerTable}
        headers={[
          {
            title: capital($_("unit", { values: { n: 1 } })),
            sortPath: "org_unit[0].name",
          },
          { title: capital($_("manager_responsibility")) },
          { title: capital($_("manager_type")), sortPath: "manager_type.name" },
          { title: capital($_("manager_level")), sortPath: "manager_level.name" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.OWNER}
      <TableTensesWrapper
        table={OwnerTable}
        headers={[
          { title: capital($_("name")), sortPath: "owner[0].name" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {/if}
  {/await}
</div>
