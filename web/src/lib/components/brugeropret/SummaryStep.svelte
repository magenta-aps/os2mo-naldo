<script lang="ts">
  import EmployeeSummary from "$lib/components/brugeropret/EmployeeSummary.svelte"
  import EngagementSummary from "$lib/components/brugeropret/EngagementSummary.svelte"
  import ItUserSummary from "$lib/components/brugeropret/ItUserSummary.svelte"
  import ManagerSummary from "$lib/components/brugeropret/ManagerSummary.svelte"
  import AddressSummary from "$lib/components/brugeropret/AddressSummary.svelte"
  import { gql } from "graphql-request"

  gql`
    mutation Create(
      $employeeInput: EmployeeCreateInput!
      $isEmployeeValid: Boolean!
      $engagementInput: EngagementCreateInput!
      $isEngagementValid: Boolean!
      $ituserInput: ITUserCreateInput!
      $isItuserValid: Boolean!
      $managerInput: ManagerCreateInput!
      $isManagerValid: Boolean!
      $addressInput: AddressCreateInput!
      $isAddressValid: Boolean!
      $date: DateTime!
    ) {
      employee_create(input: $employeeInput) @include(if: $isEmployeeValid) {
        current(at: $date) {
          uuid
        }
      }
      engagement_create(input: $engagementInput) @include(if: $isEngagementValid) {
        current(at: $date) {
          uuid
        }
      }
      ituser_create(input: $ituserInput) @include(if: $isItuserValid) {
        current(at: $date) {
          uuid
        }
      }
      manager_create(input: $managerInput) @include(if: $isManagerValid) {
        current(at: $date) {
          uuid
        }
      }
      address_create(input: $addressInput) @include(if: $isAddressValid) {
        current(at: $date) {
          uuid
        }
      }
    }
  `
</script>

<div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
  <div class="p-8 space-y-5">
    <EmployeeSummary />
    <EngagementSummary />
    <ItUserSummary />
    <ManagerSummary />
    <AddressSummary />
  </div>
</div>
