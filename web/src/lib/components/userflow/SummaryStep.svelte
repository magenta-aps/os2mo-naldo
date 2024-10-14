<script lang="ts">
  import EmployeeSummary from "$lib/components/userflow/EmployeeSummary.svelte"
  import EngagementSummary from "$lib/components/userflow/EngagementSummary.svelte"
  import ItUserSummary from "$lib/components/userflow/ItUserSummary.svelte"
  import ManagerSummary from "$lib/components/userflow/ManagerSummary.svelte"
  import AddressSummary from "$lib/components/userflow/AddressSummary.svelte"
  import type { EmployeeCreateInput } from "$lib/graphql/types"
  import type { EngagementCreateInput } from "$lib/graphql/types"
  import type { ItUserCreateInput } from "$lib/graphql/types"
  import type { ManagerCreateInput } from "$lib/graphql/types"
  import type { AddressCreateInput } from "$lib/graphql/types"
  import { date } from "$lib/stores/date"
  import { gql } from "graphql-request"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { addressInfo } from "$lib/stores/addressInfoStore"
  import { graphQLClient } from "$lib/util/http"
  import { UserFlowCreateDocument } from "./query.generated"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
  import { managerInfo } from "$lib/stores/managerInfoStore"

  gql`
    mutation UserFlowCreate(
      $employeeInput: EmployeeCreateInput!
      $engagementInput: [EngagementCreateInput!]!
      $ituserInput: [ITUserCreateInput!]!
      $managerInput: [ManagerCreateInput!]!
      $addressInput: [AddressCreateInput!]!
      $date: DateTime!
    ) {
      employee_create(input: $employeeInput) {
        current(at: $date) {
          uuid
        }
      }
      engagements_create(input: $engagementInput) {
        current(at: $date) {
          uuid
        }
      }
      itusers_create(input: $ituserInput) {
        current(at: $date) {
          uuid
        }
      }
      managers_create(input: $managerInput) {
        current(at: $date) {
          uuid
        }
      }
      addresses_create(input: $addressInput) {
        current(at: $date) {
          uuid
        }
      }
    }
  `

  const submitData = async () => {
    const employeeData: EmployeeCreateInput = {
      uuid: $employeeInfo.uuid,
      cpr_number: $employeeInfo.cprNumber.cpr_no,
      given_name: $employeeInfo.firstName,
      surname: $employeeInfo.lastName,
      nickname_given_name: $employeeInfo.nicknameFirstname,
      nickname_surname: $employeeInfo.nicknameLastname,
    }
    const engagementData: EngagementCreateInput | [] = $engagementInfo.validated
      ? {
          person: $employeeInfo.uuid,
          user_key: $engagementInfo.userkey,
          org_unit: $engagementInfo.orgUnit?.uuid,
          engagement_type: $engagementInfo.engagementType.uuid,
          job_function: $engagementInfo.jobFunction.uuid,
          primary: $engagementInfo.primary.uuid,
          validity: {
            from: $engagementInfo.fromDate,
            to: $engagementInfo.toDate ? $engagementInfo.toDate : null,
          },
        }
      : []
    const ituserData: ItUserCreateInput | [] = $ituserInfo.validated
      ? {
          person: $employeeInfo.uuid,
          itsystem: $ituserInfo.itSystem.uuid,
          user_key: $ituserInfo.userkey,
          note: $ituserInfo.notes,
          primary: $ituserInfo.primary ? $ituserInfo.primary : null,
          validity: {
            from: $engagementInfo.fromDate,
            to: $engagementInfo.toDate ? $engagementInfo.toDate : null,
          },
        }
      : []
    const managerData: ManagerCreateInput | [] = $managerInfo.validated
      ? {
          person: $employeeInfo.uuid,
          org_unit: $managerInfo.orgUnit?.uuid,
          manager_type: $managerInfo.managerType.uuid,
          manager_level: $managerInfo.managerLevel.uuid,
          responsibility: $managerInfo.responsibilities.map(
            (responsibility) => responsibility.uuid
          ),
          validity: {
            from: $engagementInfo.fromDate,
            to: $engagementInfo.toDate ? $engagementInfo.toDate : null,
          },
        }
      : []
    const addressData: AddressCreateInput | [] = $addressInfo.validated
      ? {
          person: $employeeInfo.uuid,
          address_type: $addressInfo.addressType.uuid,
          value:
            typeof $addressInfo.addressValue === "object"
              ? $addressInfo.addressValue?.value
              : $addressInfo.addressValue,
          user_key: $addressInfo.userkey,
          visibility: $addressInfo.visibility?.uuid,
          validity: {
            from: $engagementInfo.fromDate,
            to: $engagementInfo.toDate ? $engagementInfo.toDate : null,
          },
        }
      : []

    try {
      // Send mutation request
      const response = await graphQLClient().request(UserFlowCreateDocument, {
        employeeInput: employeeData,
        engagementInput: engagementData,
        ituserInput: ituserData,
        managerInput: managerData,
        addressInput: addressData,
        date: $date,
      })
      console.log("Mutation response:", response)
    } catch (error) {
      console.error("Error during mutation:", error)
    }
  }
</script>

<div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
  <div class="p-8 space-y-5">
    <EmployeeSummary />
    <EngagementSummary />
    <ItUserSummary />
    <ManagerSummary />
    <AddressSummary />
    <button
      on:click={submitData}
      disabled={!$employeeInfo.validated}
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >Submit</button
    >
  </div>
</div>
