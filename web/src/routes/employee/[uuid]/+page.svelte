<script lang="ts">
  import Tabs from "$lib/components/shared/tabs.svelte"
  import { EmployeeTab, activeEmployeeTab } from "$lib/stores/tab"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { EmployeeDocument } from "./query.generated"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import { tenses } from "$lib/stores/tenses"
  import { env } from "$env/dynamic/public"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import AddressDetailTable from "$lib/components/shared/detail_tables/address_detail_table.svelte"
  import AssociationDetailTable from "$lib/components/shared/detail_tables/association_detail_table.svelte"
  import EmployeeDetailTable from "$lib/components/employee/tables/employee_detail_table.svelte"
  import ItAssociationDetailTable from "$lib/components/employee/tables/itassociation_detail_table.svelte"
  import ItUserDetailTable from "$lib/components/shared/detail_tables/ituser_detail_table.svelte"
  import LeavesDetailTable from "$lib/components/employee/tables/leaves_detail_table.svelte"
  import ManagerDetailTable from "$lib/components/shared/detail_tables/manager_detail_table.svelte"
  import RolesDetailTable from "$lib/components/shared/detail_tables/roles_detail_table.svelte"
  import { onMount } from "svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
  import EngagementTable from "$lib/components/tables/EngagementTable.svelte"

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
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <EmployeeDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <EmployeeDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <EmployeeDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
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
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <AddressDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <AddressDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <AddressDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === EmployeeTab.ASSOCIATION}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <AssociationDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <AssociationDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <AssociationDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === EmployeeTab.ITASSOCIATION}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <ItAssociationDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <ItAssociationDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <ItAssociationDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === EmployeeTab.ROLE}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <RolesDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <RolesDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <RolesDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === EmployeeTab.IT}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <ItUserDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <ItUserDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <ItUserDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === EmployeeTab.LEAVE}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <LeavesDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <LeavesDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <LeavesDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === EmployeeTab.MANAGER}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <ManagerDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <ManagerDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <ManagerDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {/if}
  {/await}
</div>
