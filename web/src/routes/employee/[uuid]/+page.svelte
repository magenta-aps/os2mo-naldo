<script lang="ts">
  import Tabs from "$lib/components/shared/tabs.svelte"
  import { activeEmployeeTab } from "$lib/stores/tab"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { EmployeeDocument } from "./query.generated"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import { tenses } from "$lib/stores/tenses"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import AddressDetailTable from "$lib/components/shared/detail_tables/address_detail_table.svelte"
  import AssociationDetailTable from "$lib/components/shared/detail_tables/association_detail_table.svelte"
  import EmployeeDetailTable from "$lib/components/employee/tables/employee_detail_table.svelte"
  import EngagementDetailTable from "$lib/components/shared/detail_tables/engagement_detail_table.svelte"
  import ItAssociationDetailTable from "$lib/components/employee/tables/itassociation_detail_table.svelte"
  import ItUserDetailTable from "$lib/components/shared/detail_tables/ituser_detail_table.svelte"
  import LeavesDetailTable from "$lib/components/employee/tables/leaves_detail_table.svelte"
  import ManagerDetailTable from "$lib/components/shared/detail_tables/manager_detail_table.svelte"
  import RolesDetailTable from "$lib/components/shared/detail_tables/roles_detail_table.svelte"

  // Tabs
  enum itemCategory {
    EMPLOYEE = "Medarbejder",
    ENGAGEMENTS = "Engagementer",
    ADDRESSES = "Adresser",
    ASSOCIATIONS = "Tilknytninger",
    ITASSOCIATIONS = "IT-Tilknytninger",
    ROLES = "Roller",
    IT = "IT",
    LEAVE = "Orlov",
    MANAGER = "Ledere",
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
      case itemCategory.ITASSOCIATIONS:
        return "itassociation"
      case itemCategory.ROLES:
        return "role"
      case itemCategory.IT:
        return "it"
      case itemCategory.LEAVE:
        return "leave"
      case itemCategory.MANAGER:
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
</script>

<HeadTitle type="employee" />

<div class="px-12 pt-6">
  {#await graphQLClient().request( EmployeeDocument, { uuid: $page.params.uuid, fromDate: $date } )}
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
      {#if activeItem !== itemCategory.EMPLOYEE}
        <a
          class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
          href={`${base}/employee/${$page.params.uuid}/create/${subsiteOfCategory(
            activeItem
          )}`}
        >
          Tilføj {activeItem}
        </a>
      {/if}
    </div>

    <!-- TODO: Implement past present future for employees -->
    {#if activeItem === itemCategory.EMPLOYEE}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
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
    {:else if activeItem === itemCategory.ENGAGEMENTS}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <EngagementDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <EngagementDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <EngagementDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === itemCategory.ADDRESSES}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
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
    {:else if activeItem === itemCategory.ASSOCIATIONS}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
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
    {:else if activeItem === itemCategory.ITASSOCIATIONS}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
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
    {:else if activeItem === itemCategory.ROLES}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
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
    {:else if activeItem === itemCategory.IT}
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
    {:else if activeItem === itemCategory.LEAVE}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
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
    {:else if activeItem === itemCategory.MANAGER}
      <!-- TODO: future and past does not work. 
      Waiting to see if this can be done through GraphQL -->
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
