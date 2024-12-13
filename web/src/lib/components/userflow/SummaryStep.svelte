<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import EmployeeSummary from "$lib/components/userflow/EmployeeSummary.svelte"
  import EngagementSummary from "$lib/components/userflow/EngagementSummary.svelte"
  import ItUserSummary from "$lib/components/userflow/ItUserSummary.svelte"
  import RolebindingSummary from "$lib/components/userflow/RolebindingSummary.svelte"
  import ManagerSummary from "$lib/components/userflow/ManagerSummary.svelte"
  import AddressSummary from "$lib/components/userflow/AddressSummary.svelte"
  import type { EmployeeCreateInput } from "$lib/graphql/types"
  import type { EngagementCreateInput } from "$lib/graphql/types"
  import type { ItUserCreateInput } from "$lib/graphql/types"
  import type { RoleBindingCreateInput } from "$lib/graphql/types"
  import type { ManagerCreateInput } from "$lib/graphql/types"
  import type { AddressCreateInput } from "$lib/graphql/types"
  import { date } from "$lib/stores/date"
  import { gql } from "graphql-request"
  import Error from "$lib/components/alerts/Error.svelte"
  import { success, error } from "$lib/stores/alert"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
  import { rolebindingInfo } from "$lib/stores/rolebindingInfoStore"
  import { managerInfo } from "$lib/stores/managerInfoStore"
  import { addressInfo } from "$lib/stores/addressInfoStore"
  import { graphQLClient } from "$lib/util/http"
  import { UserFlowCreateDocument } from "./query.generated"
  import { resetUserflowStores } from "$lib/stores/resetStores"

  gql`
    mutation UserFlowCreate(
      $employeeInput: EmployeeCreateInput!
      $engagementInput: [EngagementCreateInput!]!
      $ituserInput: [ITUserCreateInput!]!
      $rolebindingInput: [RoleBindingCreateInput!]!
      $managerInput: [ManagerCreateInput!]!
      $addressInput: [AddressCreateInput!]!
      $date: DateTime!
    ) {
      employee_create(input: $employeeInput) {
        current(at: $date) {
          uuid
          name
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
      rolebindings_create(input: $rolebindingInput) {
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

  const submitForm = async () => {
    const employeeUUID = $employeeInfo.uuid
    const employeeData: EmployeeCreateInput = {
      uuid: employeeUUID,
      cpr_number: $employeeInfo.cprNumber.cpr_no,
      given_name: $employeeInfo.firstName,
      surname: $employeeInfo.lastName,
      nickname_given_name: $employeeInfo.nicknameFirstname,
      nickname_surname: $employeeInfo.nicknameLastname,
    }
    const engagementData: EngagementCreateInput | [] = $engagementInfo.validated
      ? {
          person: employeeUUID,
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
          person: employeeUUID,
          uuid: $ituserInfo.uuid,
          itsystem: $ituserInfo.itSystem.uuid,
          user_key: $ituserInfo.userkey,
          note: $ituserInfo.notes,
          primary: $ituserInfo.primary
            ? $ituserInfo.primary.uuid !== ""
              ? $ituserInfo.primary.uuid
              : null
            : null,
          validity: {
            from: $engagementInfo.fromDate,
            to: $engagementInfo.toDate ? $engagementInfo.toDate : null,
          },
        }
      : []
    // Only post rolebindingData, if ituser data is valid
    const rolebindingData: RoleBindingCreateInput | [] =
      $ituserInfo.validated && $rolebindingInfo.role.uuid
        ? {
            ituser: $ituserInfo.uuid,
            role: $rolebindingInfo.role.uuid,
            validity: {
              from: $rolebindingInfo.fromDate,
              to: $rolebindingInfo.toDate ? $rolebindingInfo.toDate : null,
            },
          }
        : []

    const managerData: ManagerCreateInput | [] = $managerInfo.validated
      ? {
          person: employeeUUID,
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
          person: employeeUUID,
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
      const mutation = await graphQLClient().request(UserFlowCreateDocument, {
        employeeInput: employeeData,
        engagementInput: engagementData,
        ituserInput: ituserData,
        rolebindingInput: rolebindingData,
        managerInput: managerData,
        addressInput: addressData,
        date: $date,
      })
      $success = {
        message: capital(
          $_("success_create", {
            values: {
              name: mutation.employee_create.current?.name,
            },
          })
        ),
        uuid: mutation.employee_create.current?.uuid,
        type: "employee",
      }
      resetUserflowStores()
    } catch (err) {
      $error = { message: err }
    }
  }
</script>

<div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
  <div class="p-8 space-y-5">
    <EmployeeSummary />
    <EngagementSummary />
    <ItUserSummary />
    <RolebindingSummary />
    <ManagerSummary />
    <AddressSummary />
  </div>
</div>
<div class="sm:w-full md:w-3/4 xl:w-1/2 flex justify-between py-6 gap-4">
  <button
    class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
    disabled={!$employeeInfo.validated}
    on:click={submitForm}>{capital($_("submit"))}</button
  >
  <button
    type="button"
    class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
    on:click={() => resetUserflowStores()}
  >
    {capital($_("start_over"))}
  </button>
</div>
<Error />
