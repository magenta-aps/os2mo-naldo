<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import Button from "$lib/components/shared/Button.svelte"
  import { success, error } from "$lib/stores/alert"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
  import { managerInfo } from "$lib/stores/managerInfoStore"
  import { addressInfo } from "$lib/stores/addressInfoStore"
  import { graphQLClient } from "$lib/http/client"
  import { UserFlowCreateDocument } from "./query.generated"
  import { resetUserflowStores } from "$lib/stores/resetStores"
  import { buildUserflowPayload, getUserflowUuids } from "$lib/userflow/mappers"

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

  // Uuids are minted per wizard run and keyed by item identity, so items can
  // be added on the hub without re-pairing anything; see mappers.ts.
  $: uuids = getUserflowUuids(
    $ituserInfo.map((item, index) => item._key ?? `index-${index}`)
  )

  $: ({ payload, skipped } = buildUserflowPayload(
    {
      employee: $employeeInfo,
      engagements: $engagementInfo,
      itusers: $ituserInfo,
      managers: $managerInfo,
      addresses: $addressInfo,
    },
    uuids
  ))

  // Unlike the old wizard, incomplete rows block creation instead of being
  // silently excluded — they are visible on the hub, so the honest options
  // are finishing or removing them.
  $: blocked = !$employeeInfo.validated || skipped.length > 0

  const entityLabel = (entityKey: string, index: number) =>
    `${capital($_(entityKey, { values: { n: 1 } }))} ${index + 1}`

  const submitForm = async () => {
    try {
      const mutation = await graphQLClient().request(UserFlowCreateDocument, {
        ...payload,
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

  const discard = () => {
    if (window.confirm(capital($_("confirm_discard_draft")))) {
      resetUserflowStores()
    }
  }
</script>

<div class="grid gap-3 lg:sticky lg:top-4">
  <div class="bg-base-200 rounded-sm p-4">
    <h4 class="text-xs font-bold uppercase tracking-wide text-base-content/60 mb-2">
      {capital($_("will_be_created"))}
    </h4>
    <ul class="text-sm grid gap-1 tabular-nums">
      <li class="flex justify-between">
        <span>{capital($_("employee", { values: { n: 1 } }))}</span><span>1</span>
      </li>
      <li class="flex justify-between">
        <span>{capital($_("engagement", { values: { n: 2 } }))}</span>
        <span>{payload.engagementInput.length}</span>
      </li>
      <li class="flex justify-between">
        <span>{capital($_("ituser", { values: { n: 2 } }))}</span>
        <span>{payload.ituserInput.length}</span>
      </li>
      <li class="flex justify-between">
        <span>{capital($_("rolebinding", { values: { n: 2 } }))}</span>
        <span>{payload.rolebindingInput.length}</span>
      </li>
      <li class="flex justify-between">
        <span>{capital($_("manager", { values: { n: 2 } }))}</span>
        <span>{payload.managerInput.length}</span>
      </li>
      <li class="flex justify-between">
        <span>{capital($_("address", { values: { n: 2 } }))}</span>
        <span>{payload.addressInput.length}</span>
      </li>
    </ul>
    {#if !$employeeInfo.validated}
      <div class="alert alert-warning text-xs rounded-sm mt-3 py-2 px-3">
        {capital($_("employee_required_first"))}
      </div>
    {/if}
    {#if skipped.length}
      <div class="alert alert-warning text-xs rounded-sm mt-3 py-2 px-3">
        <span>
          {capital($_("incomplete_items_blocking"))}
          {skipped.map((item) => entityLabel(item.entityKey, item.index)).join(", ")}
        </span>
      </div>
    {/if}
    <div class="pt-3">
      <Button
        type="button"
        title={capital(
          $_("create_item", {
            values: { item: $_("employee", { values: { n: 1 } }) },
          })
        )}
        disabled={blocked}
        extraClasses="w-full"
        on:click={submitForm}
      />
    </div>
  </div>
  <button
    type="button"
    class="text-xs text-base-content/60 hover:text-error text-center py-1"
    on:click={discard}
  >
    {capital($_("discard_draft"))}…
  </button>
</div>
