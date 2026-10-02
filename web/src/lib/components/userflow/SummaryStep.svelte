<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import { date } from "$lib/stores/date"
  import { firstValidDay, formatDay, lastValidDay } from "$lib/utils/date"
  import { gql } from "graphql-request"
  import Error from "$lib/components/alerts/Error.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import SummaryCard from "$lib/components/userflow/SummaryCard.svelte"
  import { success, error } from "$lib/stores/alert"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
  import { managerInfo } from "$lib/stores/managerInfoStore"
  import { addressInfo } from "$lib/stores/addressInfoStore"
  import { graphQLClient } from "$lib/http/client"
  import { UserFlowCreateDocument } from "./query.generated"
  import { resetUserflowStores } from "$lib/stores/resetStores"
  import { buildUserflowPayload, reserveUserflowUuids } from "$lib/userflow/mappers"

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

  // An earlier-approved tab may have been edited into invalidity since; this
  // moves it to the warning list rather than submitting it.
  employeeInfo.revalidate()
  engagementInfo.revalidate()
  ituserInfo.revalidate()
  managerInfo.revalidate()
  addressInfo.revalidate()

  // Reactive, not a one-shot read: buildUserflowPayload pairs uuids to itusers
  // by position, so both must come from the same $ituserInfo.
  $: uuids = reserveUserflowUuids($ituserInfo.map((item) => item._key))

  $: ({ payload, incomplete } = buildUserflowPayload(
    {
      employee: $employeeInfo,
      engagements: $engagementInfo,
      itusers: $ituserInfo,
      managers: $managerInfo,
      addresses: $addressInfo,
    },
    uuids
  ))

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

  const dash = (value: string | undefined | null) => value ?? ""

  $: employeeSections = [
    {
      rows: [
        {
          label: capital($_("cpr_number")),
          value:
            $employeeInfo.validated === true
              ? $employeeInfo.cprNumber.cpr_no.trim().slice(0, 6)
              : "",
        },
        {
          label: capital($_("givenname", { values: { n: 2 } })),
          value: $employeeInfo.validated === true ? $employeeInfo.firstName : "",
        },
        {
          label: capital($_("surname", { values: { n: 2 } })),
          value: $employeeInfo.validated === true ? $employeeInfo.lastName : "",
        },
        {
          label: capital($_("nickname_givenname", { values: { n: 2 } })),
          value:
            $employeeInfo.validated === true ? $employeeInfo.nicknameFirstname : "",
        },
        {
          label: capital($_("nickname_surname", { values: { n: 2 } })),
          value: $employeeInfo.validated === true ? $employeeInfo.nicknameLastname : "",
        },
      ],
    },
  ]

  $: engagementSections = $engagementInfo
    .map((engagement, index) => ({ engagement, index }))
    .filter(({ engagement }) => engagement.validated === true)
    .map(({ engagement, index }) => ({
      subtitle: `${capital($_("engagement", { values: { n: 1 } }))} ${index + 1}`,
      rows: [
        {
          label: capital($_("date.start_date")),
          value: formatDay(firstValidDay(engagement.fromDate)),
        },
        {
          label: capital($_("date.end_date")),
          value: formatDay(lastValidDay(engagement.toDate)),
        },
        {
          label: capital($_("unit", { values: { n: 1 } })),
          value: dash(engagement.orgUnit?.name),
        },
        {
          label: env.PUBLIC_SHOW_EXTENSION_1
            ? capital($_("job_code"))
            : capital($_("job_function", { values: { n: 1 } })),
          value: dash(engagement.jobFunction?.name),
        },
        ...(env.PUBLIC_SHOW_EXTENSION_1
          ? [
              {
                label: capital($_("job_function", { values: { n: 1 } })),
                value: engagement.extension1,
              },
            ]
          : []),
        ...(env.PUBLIC_SHOW_EXTENSION_4
          ? [
              {
                label: capital($_("department_code")),
                value: engagement.extension4,
              },
            ]
          : []),
        {
          label: capital($_("engagement_type", { values: { n: 1 } })),
          value: dash(engagement.engagementType?.name),
        },
        { label: capital($_("id")), value: engagement.user_key },
        { label: capital($_("primary")), value: dash(engagement.primary?.name) },
      ],
    }))

  $: ituserSections = $ituserInfo
    .map((ituser, index) => ({ ituser, index }))
    .filter(({ ituser }) => ituser.validated === true)
    .map(({ ituser, index }) => ({
      subtitle: `${capital($_("ituser", { values: { n: 1 } }))} ${index + 1}`,
      rows: [
        {
          label: capital($_("date.start_date")),
          value: formatDay(firstValidDay(ituser.fromDate)),
        },
        {
          label: capital($_("date.end_date")),
          value: formatDay(lastValidDay(ituser.toDate)),
        },
        {
          label: capital($_("itsystem", { values: { n: 1 } })),
          value: dash(ituser.itSystem?.name),
        },
        { label: capital($_("account_name")), value: ituser.user_key },
        { label: capital($_("primary")), value: dash(ituser.primary?.name) },
        { label: capital($_("external_id")), value: ituser.externalId },
        { label: capital($_("notes")), value: ituser.notes },
        ...(ituser.rolebindings.some((rolebinding) => rolebinding.role?.uuid)
          ? [
              {
                label: capital($_("rolebinding", { values: { n: 2 } })),
                value: ituser.rolebindings
                  .filter((rolebinding) => rolebinding.role?.uuid)
                  .map((rolebinding) => rolebinding.role?.name ?? ""),
              },
            ]
          : []),
      ],
    }))

  $: managerSections = $managerInfo
    .map((manager, index) => ({ manager, index }))
    .filter(({ manager }) => manager.validated === true)
    .map(({ manager, index }) => ({
      subtitle: `${capital($_("manager", { values: { n: 1 } }))} ${index + 1}`,
      rows: [
        {
          label: capital($_("date.start_date")),
          value: formatDay(firstValidDay(manager.fromDate)),
        },
        {
          label: capital($_("date.end_date")),
          value: formatDay(lastValidDay(manager.toDate)),
        },
        {
          label: capital($_("unit", { values: { n: 1 } })),
          value: dash(manager.orgUnit?.name),
        },
        {
          label: capital($_("manager_type")),
          value: dash(manager.managerType?.name),
        },
        {
          label: capital($_("manager_level")),
          value: dash(manager.managerLevel?.name),
        },
        {
          label: capital($_("manager_responsibility")),
          value: (manager.responsibilities ?? []).map(
            (responsibility) => responsibility.name
          ),
        },
      ],
    }))

  $: addressSections = $addressInfo
    .map((address, index) => ({ address, index }))
    .filter(({ address }) => address.validated === true)
    .map(({ address, index }) => ({
      subtitle: `${capital($_("address", { values: { n: 1 } }))} ${index + 1}`,
      rows: [
        {
          label: capital($_("date.start_date")),
          value: formatDay(firstValidDay(address.fromDate)),
        },
        {
          label: capital($_("date.end_date")),
          value: formatDay(lastValidDay(address.toDate)),
        },
        { label: capital($_("visibility")), value: dash(address.visibility?.name) },
        { label: capital($_("description")), value: address.user_key },
        {
          label: capital($_("address_type", { values: { n: 1 } })),
          value: dash(address.addressType?.name),
        },
        {
          label: capital(dash(address.addressType?.name)),
          value: address.addressValue.name
            ? address.addressValue.name
            : address.addressValue.value,
        },
      ],
    }))

  const entityLabel = (entityKey: string, index: number) =>
    `${capital($_(entityKey, { values: { n: 1 } }))} ${index + 1}`
</script>

<div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
  <div class="p-8 space-y-5">
    <SummaryCard
      title={capital($_("employee", { values: { n: 1 } }))}
      sections={employeeSections}
    />
    <SummaryCard
      title={capital($_("engagement", { values: { n: 2 } }))}
      sections={engagementSections}
    />
    <SummaryCard
      title={capital($_("ituser", { values: { n: 2 } }))}
      sections={ituserSections}
    />
    <SummaryCard
      title={capital($_("manager", { values: { n: 2 } }))}
      sections={managerSections}
    />
    <SummaryCard
      title={capital($_("address", { values: { n: 2 } }))}
      sections={addressSections}
    />
  </div>
</div>
<!-- The employee anchors every other entity, so its demotion blocks the whole
     submission rather than skipping one item. -->
{#if $employeeInfo.validated !== true}
  <div class="sm:w-full md:w-3/4 xl:w-1/2 alert alert-error rounded-sm mt-4">
    <span>{capital($_("employee_incomplete_warning"))}</span>
  </div>
{/if}
{#if incomplete.length}
  <div class="sm:w-full md:w-3/4 xl:w-1/2 alert alert-warning rounded-sm mt-4">
    <span>
      {capital($_("incomplete_items_warning"))}
      {incomplete.map((item) => entityLabel(item.entityKey, item.index)).join(", ")}
    </span>
  </div>
{/if}
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
