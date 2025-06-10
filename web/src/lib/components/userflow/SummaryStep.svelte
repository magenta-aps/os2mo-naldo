<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import EmployeeSummary from "$lib/components/userflow/EmployeeSummary.svelte"
  import EngagementSummary from "$lib/components/userflow/EngagementSummary.svelte"
  import ItuserSummary from "$lib/components/userflow/ItuserSummary.svelte"
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
  import Button from "$lib/components/shared/Button.svelte"
  import { success, error } from "$lib/stores/alert"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
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

    const engagementData: EngagementCreateInput[] = []
    for (const engagement of $engagementInfo) {
      if (!engagement.validated) continue
      engagementData.push({
        person: employeeUUID,
        user_key: engagement.userkey,
        org_unit: engagement.orgUnit?.uuid,
        engagement_type: engagement.engagementType.uuid,
        job_function: engagement.jobFunction.uuid,
        primary: engagement.primary?.uuid || null,
        validity: {
          from: engagement.fromDate,
          to: engagement.toDate || null,
        },
      })
    }

    const ituserData: ItUserCreateInput[] = []
    const rolebindingData: RoleBindingCreateInput[] = []

    for (const ituser of $ituserInfo) {
      if (!ituser.validated) continue
      ituserData.push({
        person: employeeUUID,
        uuid: ituser.uuid,
        itsystem: ituser.itSystem.uuid,
        user_key: ituser.userkey,
        note: ituser.notes,
        primary:
          ituser.primary?.uuid && ituser.primary.uuid !== ""
            ? ituser.primary.uuid
            : null,
        validity: {
          from: ituser.fromDate,
          to: ituser.toDate || null,
        },
      })

      const rolebindings = ituser.rolebindings
        .filter((rb) => rb.role?.uuid)
        .map((rb) => ({
          ituser: ituser.uuid,
          role: rb.role.uuid,
          validity: {
            from: ituser.fromDate,
            to: ituser.toDate || null,
          },
        }))

      rolebindingData.push(...rolebindings)
    }

    const managerData: ManagerCreateInput[] = []
    for (const manager of $managerInfo) {
      if (!manager.validated) continue
      managerData.push({
        person: employeeUUID,
        org_unit: manager.orgUnit?.uuid,
        manager_type: manager.managerType.uuid,
        manager_level: manager.managerLevel.uuid,
        responsibility: manager.responsibilities.map(
          (responsibility) => responsibility.uuid
        ),
        validity: {
          from: manager.fromDate,
          to: manager.toDate ? manager.toDate : null,
        },
      })
    }

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
            from: $addressInfo.fromDate,
            to: $addressInfo.toDate ? $addressInfo.toDate : null,
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
    <ItuserSummary />
    <ManagerSummary />
    <AddressSummary />
  </div>
</div>
<div class="sm:w-full md:w-3/4 xl:w-1/2 flex justify-between py-6 gap-4">
  <Button
    type="submit"
    title={capital($_("submit"))}
    disabled={!$employeeInfo.validated}
    on:click={submitForm}
  />
  <Button
    type="button"
    title={capital($_("start_over"))}
    outline={true}
    on:click={() => resetUserflowStores()}
  />
</div>
<Error />
