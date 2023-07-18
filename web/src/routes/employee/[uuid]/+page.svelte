<script lang="ts">
  import Tabs from "$lib/components/shared/tabs.svelte"
  import { activeEmployeeTab } from "$lib/stores/tab"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { EmployeeDocument } from "./query.generated"
  import EmployeeDetailTable from "$lib/components/employee/tables/employee_detail_table.svelte"
  import EngagementDetailTable from "$lib/components/employee/tables/engagement_detail_table.svelte"
  import AddressesDetailTable from "$lib/components/employee/tables/addresses_detail_table.svelte"
  import AssociationsDetailTable from "$lib/components/employee/tables/associations_detail_table.svelte"
  import RolesDetailTable from "$lib/components/employee/tables/roles_detail_table.svelte"
  import ManagerRolesDetailTable from "$lib/components/employee/tables/manager_roles_detail_table.svelte"
  import LeavesDetailTable from "$lib/components/employee/tables/leaves_detail_table.svelte"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import { tenses } from "$lib/stores/tenses"
  import { base } from "$app/paths"

  // Tabs
  enum itemCategory {
    EMPLOYEE = "Medarbejder",
    ENGAGEMENTS = "Engagementer",
    ADDRESSES = "Adresser",
    ASSOCIATIONS = "Tilknytninger",
    ROLES = "Roller",
    IT = "IT",
    LEAVE = "Orlov",
    MANAGER_ROLES = "Ledere",
  }

  let items = Object.values(itemCategory)

  let activeItem: string = $activeEmployeeTab
  const tabChange = (e: CustomEvent) => ($activeEmployeeTab = activeItem = e.detail)

  // Used to make a dynamic create button
  const subsiteOfCategory = (category: string) => {
    switch (category) {
      case itemCategory.EMPLOYEE:
        return "employee"
      case itemCategory.ENGAGEMENTS:
        return "engagement"
      case itemCategory.ADDRESSES:
        return "address"
      case itemCategory.ASSOCIATIONS:
        return "association"
      case itemCategory.ROLES:
        return "roles"
      case itemCategory.IT:
        return "it"
      case itemCategory.LEAVE:
        return "leave"
      case itemCategory.MANAGER_ROLES:
        return "manager_role"
      default:
        console.warn("The tab doesn't match a subsite")
        return
    }
  }

  gql`
    query Employee($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          name
          cpr_no
        }
      }
    }
  `
</script>

<HeadTitle type="employee" />

{#await graphQLClient().request(EmployeeDocument, { uuid: $page.params.uuid })}
  <div class="px-12 pt-6">
    <p>Loader medarbejder...</p>
  </div>
{:then data}
  {@const employee = data.employees[0].objects[0]}
  <div class="px-12 pt-6">
    <h1 class="mb-4">
      {employee.name}
      <span class="text-slate-600">
        {employee.cpr_no
          ? `(${employee.cpr_no.slice(4)}-${employee.cpr_no.slice(-4)})`
          : ""}
      </span>
    </h1>

    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    <div class="mb-8" />
    <div class="flex justify-between">
      <TenseTabs />
      <a
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
        href={`${base}/employee/${$page.params.uuid}/create/${subsiteOfCategory(activeItem)}`}
      >
        Tilføj {activeItem}
      </a>
    </div>

    <!-- TODO: Implement past present future for employees -->
    {#if activeItem === itemCategory.EMPLOYEE}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <EmployeeDetailTable tense="future" />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <EmployeeDetailTable tense="present" />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <EmployeeDetailTable tense="past" />
      {/if}
    {:else if activeItem === itemCategory.ENGAGEMENTS}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <EngagementDetailTable tense="future" />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <EngagementDetailTable tense="present" />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <EngagementDetailTable tense="past" />
      {/if}
    {:else if activeItem === itemCategory.ADDRESSES}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <AddressesDetailTable tense="future" />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <AddressesDetailTable tense="present" />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <AddressesDetailTable tense="past" />
      {/if}
    {:else if activeItem === itemCategory.ASSOCIATIONS}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <AssociationsDetailTable tense="future" />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <AssociationsDetailTable tense="present" />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <AssociationsDetailTable tense="past" />
      {/if}
    {:else if activeItem === itemCategory.ROLES}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <RolesDetailTable tense="future" />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <RolesDetailTable tense="present" />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <RolesDetailTable tense="past" />
      {/if}
    {:else if activeItem === itemCategory.IT}
      <!-- TODO: Missing GraphQL  -->
      TODO
    {:else if activeItem === itemCategory.LEAVE}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <LeavesDetailTable tense="future" />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <LeavesDetailTable tense="present" />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <LeavesDetailTable tense="past" />
      {/if}
    {:else if activeItem === itemCategory.MANAGER_ROLES}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <ManagerRolesDetailTable tense="future" />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <ManagerRolesDetailTable tense="present" />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <ManagerRolesDetailTable tense="past" />
      {/if}
    {/if}
  </div>
{/await}
