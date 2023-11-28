<script lang="ts">
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

  // Tabs
  let items = Object.values(EmployeeTab)

  // TODO: Move tab logic into tabs.svelte
  if (env.PUBLIC_SHOW_ITASSOCIATION_TAB === "false") {
    items = items.filter((tab) => tab !== EmployeeTab.ITASSOCIATION)
  }

  let uuidFromUrl = $page.params.uuid

  let activeItem = $activeEmployeeTab
  const tabChange = (e: CustomEvent) => ($activeEmployeeTab = activeItem = e.detail)

  // Used to make a dynamic create button
  const subsiteOfCategory = (category: EmployeeTab) => {
    switch (category) {
      case EmployeeTab.EMPLOYEE:
        return "employee"
      case EmployeeTab.ENGAGEMENT:
        return "engagement"
      case EmployeeTab.ADDRESS:
        return "address"
      case EmployeeTab.ASSOCIATION:
        return "association"
      case EmployeeTab.ITASSOCIATION:
        return "itassociation"
      case EmployeeTab.ROLE:
        return "role"
      case EmployeeTab.IT:
        return "it"
      case EmployeeTab.LEAVE:
        return "leave"
      case EmployeeTab.MANAGER:
        return "manager"
      default:
        console.warn("The tab doesn't match a subsite")
        return
    }
  }

  gql`
    query Employee($uuid: [UUID!], $fromDate: DateTime) {
      employees(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            name
            cpr_no
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
        {employee.cpr_no
          ? `(${employee.cpr_no.slice(0, 6)}-${employee.cpr_no.slice(-4)})`
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
            : `${$page.params.uuid}/create/${subsiteOfCategory(activeItem)}`
        }`}
      >
        Tilføj {activeItem}
      </a>
    </div>

    {#if activeItem === EmployeeTab.EMPLOYEE}
      <TableTensesWrapper
        table={EmployeeTable}
        headers={[
          { title: "Navn", sortPath: "name" },
          { title: "Kaldenavn", sortPath: "nickname" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ENGAGEMENT}
      <TableTensesWrapper
        table={EngagementTable}
        headers={[
          { title: "Enhed", sortPath: "org_unit[0].name" },
          { title: "Stillingsbetegnelse", sortPath: "job_function.name" },
          { title: "Engagementstype", sortPath: "engagement_type.name" },
          { title: "Primær" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ADDRESS}
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
    {:else if activeItem === EmployeeTab.ASSOCIATION}
      <TableTensesWrapper
        table={AssociationTable}
        headers={[
          { title: "Enhed", sortPath: "org_unit[0].name" },
          { title: "Tilknytningsrolle", sortPath: "association_type.name" },
          { title: "Primær" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ITASSOCIATION}
      <TableTensesWrapper
        table={ItAssociationTable}
        headers={[
          { title: "Enhed", sortPath: "org_unit[0].name" },
          { title: "Stillingsbetegnelse", sortPath: "job_function.name" },
          { title: "IT system", sortPath: "it_user[0].itsystem.name" },
          { title: "Kontonavn", sortPath: "it_user[0].user_key" },
          { title: "Primær" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.ROLE}
      <TableTensesWrapper
        table={RoleTable}
        headers={[
          { title: "Enhed", sortPath: "org_unit[0].name" },
          { title: "Rolletype", sortPath: "role_type.name" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.IT}
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
    {:else if activeItem === EmployeeTab.LEAVE}
      <TableTensesWrapper
        table={LeaveTable}
        headers={[
          { title: "Orlovstype", sortPath: "leave_type.name" },
          { title: "Engagement", sortPath: "engagement.job_function.name" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {:else if activeItem === EmployeeTab.MANAGER}
      <TableTensesWrapper
        table={ManagerTable}
        headers={[
          { title: "Enhed", sortPath: "org_unit[0].name" },
          { title: "Lederansvar" },
          { title: "Ledertype", sortPath: "manager_type.name" },
          { title: "Lederniveau", sortPath: "manager_level.name" },
          { title: "Dato", sortPath: "validity.from" },
          { title: "" },
          { title: "" },
        ]}
      />
    {/if}
  {/await}
</div>
