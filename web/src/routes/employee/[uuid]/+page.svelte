<script lang="ts">
  import { _ } from "svelte-i18n"
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

  // Tabs
  let items = [
    { label: $_("employee"), value: "employee" },
    { label: $_("engagement"), value: "engagement" },
    { label: $_("address"), value: "address" },
    { label: $_("association"), value: "association" },
    { label: $_("itassociation"), value: "itassociation" },
    { label: $_("role"), value: "role" },
    { label: $_("it"), value: "it" },
    { label: $_("leave"), value: "leave" },
    { label: $_("manager"), value: "manager" },
    { label: $_("owner"), value: "owner" },
  ]

  // TODO: Move tab logic into tabs.svelte
  if (env.PUBLIC_SHOW_ITASSOCIATION_TAB === "false") {
    items = items.filter((tab) => tab.value !== EmployeeTab.ITASSOCIATION)
  }

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
    <p>Loader medarbejder...</p>
  {:then data}
    {@const employee = data.employees.objects[0].objects[0]}
    <h1 class="mb-4">
      {employee.name}
      <span class="text-slate-600">
        {employee.cpr_number
          ? `(${employee.cpr_number.slice(0, 6)}-${employee.cpr_number.slice(-4)})`
          : ""}
      </span>
    </h1>

    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    <div class="flex justify-between">
      <TenseTabs />
      <a
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
        href={`${base}/employee/${
          activeItem === EmployeeTab.EMPLOYEE
            ? "create"
            : `${$page.params.uuid}/create/${activeItem}`
        }`}
      >
        {$_("add")}
        {activeItem}
      </a>
    </div>

    {#if activeItem === EmployeeTab.EMPLOYEE}
      <TableTensesWrapper
        table={EmployeeTable}
        headers={[
          { title: $_("name"), sortPath: "name" },
          { title: $_("nickname"), sortPath: "nickname" },
          { title: $_("date.date"), sortPath: "validity.from" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ENGAGEMENT}
      <TableTensesWrapper
        table={EngagementTable}
        headers={[
          { title: $_("unit"), sortPath: "org_unit[0].name" },
          { title: $_("job_function"), sortPath: "job_function.name" },
          { title: $_("engagement_type"), sortPath: "engagement_type.name" },
          { title: $_("primary") },
          { title: $_("date.date"), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ADDRESS}
      <TableTensesWrapper
        table={AddressTable}
        headers={[
          { title: $_("address_type"), sortPath: "address_type.name" },
          { title: $_("address"), sortPath: "name" },
          // TODO: Make it possible to sort optional fields maybe? visibility and primary for example
          { title: $_("visibility") },
          { title: $_("date.date"), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ASSOCIATION}
      <TableTensesWrapper
        table={AssociationTable}
        headers={[
          { title: $_("unit"), sortPath: "org_unit[0].name" },
          { title: $_("association_type"), sortPath: "association_type.name" },
          { title: $_("primary") },
          { title: $_("date.date"), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ITASSOCIATION}
      <TableTensesWrapper
        table={ItAssociationTable}
        headers={[
          { title: $_("unit"), sortPath: "org_unit[0].name" },
          { title: $_("job_function"), sortPath: "job_function.name" },
          { title: $_("it_system"), sortPath: "it_user[0].itsystem.name" },
          { title: $_("account_name"), sortPath: "it_user[0].user_key" },
          { title: $_("primary") },
          { title: $_("date.date"), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ROLE}
      <TableTensesWrapper
        table={RoleTable}
        headers={[
          { title: $_("unit"), sortPath: "org_unit[0].name" },
          { title: $_("role_type"), sortPath: "role_type.name" },
          { title: $_("date.date"), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.IT}
      <TableTensesWrapper
        table={ItUserTable}
        headers={[
          { title: $_("it_system"), sortPath: "itsystem.name" },
          { title: $_("account_name"), sortPath: "user_key" },
          { title: $_("primary") },
          { title: $_("date.date"), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.LEAVE}
      <TableTensesWrapper
        table={LeaveTable}
        headers={[
          { title: $_("leave_type"), sortPath: "leave_type.name" },
          { title: $_("engagement"), sortPath: "engagement.job_function.name" },
          { title: $_("date.date"), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.MANAGER}
      <TableTensesWrapper
        table={ManagerTable}
        headers={[
          { title: $_("unit"), sortPath: "org_unit[0].name" },
          { title: $_("manager_responsibility") },
          { title: $_("manager_type"), sortPath: "manager_type.name" },
          { title: $_("manager_level"), sortPath: "manager_level.name" },
          { title: $_("date.date"), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.OWNER}
      <TableTensesWrapper
        table={OwnerTable}
        headers={[
          { title: $_("name"), sortPath: "owner[0].name" },
          { title: $_("date.date"), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {/if}
  {/await}
</div>
