<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital, upperCase } from "$lib/util/translationUtils"
  import Tabs from "$lib/components/shared/Tabs.svelte"
  import CopyToClipboard from "$lib/components/shared/Clipboard.svelte"
  import { EmployeeTab, ItTab, activeEmployeeTab, activeItTab } from "$lib/stores/tab"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { EmployeeDocument } from "./query.generated"
  import TenseTabs from "$lib/components/shared/TenseTabs.svelte"
  import Button from "$lib/components/shared/Button.svelte"
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
  import ManagerTable from "$lib/components/tables/ManagerTable.svelte"
  import LeaveTable from "$lib/components/tables/LeaveTable.svelte"
  import OwnerTable from "$lib/components/tables/OwnerTable.svelte"
  import RoleBindingTable from "$lib/components/tables/RoleBindingTable.svelte"
  import { MOConfig } from "$lib/stores/config"

  // Tabs
  // "n" used for deciding which translation to use in Tabs
  let items = [
    { label: "employee", value: "employee", n: 1 },
    { label: "engagement", value: "engagement", n: 2 },
    { label: "address", value: "address", n: 2 },
    { label: "association", value: "association", n: 2 },
    { label: "itassociation", value: "itassociation", n: 2 },
    { label: "ituser", value: "ituser", n: 2 },
    { label: "leave", value: "leave", n: 2 },
    { label: "manager", value: "manager", n: 2 },
    { label: "owner", value: "owner", n: 2 },
  ]

  let itItems = [
    { label: "ituser", value: "ituser", n: 2 },
    { label: "rolebinding", value: "rolebinding", n: 2 },
  ]

  let uuidFromUrl = $page.params.uuid
  let activeItem = $activeEmployeeTab
  const tabChange = (e: CustomEvent) => {
    $activeEmployeeTab = activeItem = e.detail
  }

  let itActiveItem = $activeItTab
  const itTabChange = (e: CustomEvent) => {
    $activeItTab = itActiveItem = e.detail
  }

  gql`
    query Employee($uuid: [UUID!], $fromDate: DateTime) {
      employees(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
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
        if (firstHash === ItTab.ROLEBINDING) {
          // Since rolebinding is not an EmployeeTab, we need to make sure we go to EmployeeTab.IT
          // and also change activeItTab to rolebinding/it
          $activeEmployeeTab = activeItem = EmployeeTab.IT as EmployeeTab
          $activeItTab = itActiveItem = firstHash as ItTab
        } else {
          // Safe to assume the hash is an EmployeeTab
          $activeEmployeeTab = activeItem = firstHash as EmployeeTab
        }
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
      {#if $MOConfig && $MOConfig.confdb_show_cpr_no === "true"}
        <span class="text-slate-600">
          {employee.cpr_number
            ? `(${employee.cpr_number.slice(0, 6)}-${employee.cpr_number.slice(-4)})`
            : ""}
        </span>
      {/if}
      <CopyToClipboard uuid={employee.uuid} name={employee.name} />
    </h1>

    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    <div class="flex justify-between">
      <TenseTabs />
      {#if activeItem === EmployeeTab.IT}
        <Button
          type="button"
          title={capital(
            $_("create_item", {
              values: { item: $_(itActiveItem, { values: { n: 1 } }) },
            })
          )}
          href="{base}/employee/{$page.params.uuid}/create/{itActiveItem}"
          extraClasses="my-5"
        />
      {:else}
        <Button
          type="button"
          title={capital(
            $_("create_item", {
              values: { item: $_(activeItem, { values: { n: 1 } }) },
            })
          )}
          href="{base}/employee/{activeItem === EmployeeTab.EMPLOYEE
            ? 'create/employee'
            : `${$page.params.uuid}/create/${activeItem}`}"
          extraClasses="my-5"
        />
      {/if}
    </div>

    {#if activeItem === EmployeeTab.EMPLOYEE}
      <TableTensesWrapper
        table={EmployeeTable}
        headers={[
          { title: capital($_("name")), sortPath: "name" },
          { title: capital($_("nickname")), sortPath: "nickname" },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
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
            title: capital($_("department_code")),
            sortPath: "sd_code",
          },
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
          {
            title: capital($_("manager", { values: { n: 1 } })),
          },
          { title: capital($_("primary")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ADDRESS}
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
    {:else if activeItem === EmployeeTab.ASSOCIATION}
      <TableTensesWrapper
        table={AssociationTable}
        headers={[
          {
            title: capital($_("unit", { values: { n: 1 } })),
            sortPath: "org_unit[0].name",
          },
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
    {:else if activeItem === EmployeeTab.ITASSOCIATION}
      <TableTensesWrapper
        table={ItAssociationTable}
        headers={[
          {
            title: capital($_("unit", { values: { n: 1 } })),
            sortPath: "org_unit[0].name",
          },
          {
            title:
              env.PUBLIC_SHOW_EXTENSION_1 === "true"
                ? capital($_("job_code"))
                : capital($_("job_function", { values: { n: 1 } })),
            sortPath: "job_function.name",
          },
          { title: capital($_("it_system")), sortPath: "it_user[0].itsystem.name" },
          { title: capital($_("account_name")), sortPath: "it_user[0].user_key" },
          { title: capital($_("primary")) },
          { title: capital($_("date.date")), sortPath: "validity.from" },
          { title: "" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.IT}
      <Tabs
        activeItem={itActiveItem}
        items={itItems}
        on:tabChange={itTabChange}
        extra_classes="mb-2"
      />
      {#if itActiveItem === ItTab.IT}
        <TableTensesWrapper
          table={ItUserTable}
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
          { title: "" },
        ]}
      />
    {/if}
  {/await}
</div>
