<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import { LeaveAndFacetDocument, UpdateLeaveDocument } from "./query.generated"
  import {
    getEngagementTitlesAndUuid,
    getEngagementValidities,
  } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Search from "$lib/components/Search.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  let toDate: string

  let selectedEngagement: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const leaveType = field("leave_type", "", [required()])
  const engagement = field("engagement", "", [required()])
  const svelteForm = form(fromDate, leaveType, engagement)

  gql`
    query LeaveAndFacet(
      $uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $currentDate: DateTime
    ) {
      facets(filter: { user_keys: ["leave_type"] }) {
        objects {
          validities {
            uuid
            user_key
            classes(filter: { from_date: $currentDate }) {
              uuid
              user_key
              name
            }
          }
        }
      }
      leaves(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            engagement {
              uuid
              validity {
                from
                to
              }
              uuid
              org_unit {
                name
              }
              job_function {
                name
              }
            }
            leave_type {
              uuid
              user_key
              name
            }
            validity {
              from
              to
            }
            person {
              uuid
              name
              engagements {
                uuid
                org_unit {
                  uuid
                  name
                }
                job_function {
                  uuid
                  name
                }
              }
            }
          }
        }
      }
    }

    mutation UpdateLeave($input: LeaveUpdateInput!, $date: DateTime!) {
      leave_update(input: $input) {
        current(at: $date) {
          person {
            name
          }
        }
      }
    }
  `

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  $: if (selectedEngagement) {
    ;(async () => {
      validities = await getEngagementValidities(selectedEngagement.uuid)
    })()
  } else {
    validities = { from: null, to: null }
  }

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateLeaveDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit_item", {
                  values: {
                    item: $_("leave", { values: { n: 0 } }),
                    name: mutation.leave_update.current?.person?.[0].name,
                  },
                })
              ),
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("leave", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("leave", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( LeaveAndFacetDocument, { uuid: $page.params.leave, employeeUuid: $page.params.uuid, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to"), currentDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const leave = data.leaves.objects[0].validities[0]}
  {@const facets = data.facets.objects}
  {@const engagements = leave.person[0].engagements}
  {@const employee = leave.person[0]}
  {@const engagementStartValue = getEngagementTitlesAndUuid([leave.engagement])[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <!-- TODO: dynamically change dates depending on which org has been chosen -->
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={toDate ? toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={leave.validity.to ? leave.validity.to.split("T")[0] : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>

        <Select
          startValue={leave.leave_type}
          title={capital($_("leave_type"))}
          id="leave-type-uuid"
          bind:name={$leaveType.value}
          errors={$leaveType.errors}
          iterable={getClassesByFacetUserKey(facets, "leave_type")}
          required={true}
        />
        <Search
          type="employee"
          startValue={{
            uuid: employee.uuid,
            name: employee.name,
          }}
          disabled
          required={true}
        />
        <Select
          title={capital($_("engagement", { values: { n: 2 } }))}
          id="engagement-uuid"
          startValue={engagementStartValue}
          bind:value={selectedEngagement}
          bind:name={$engagement.value}
          errors={$engagement.errors}
          iterable={getEngagementTitlesAndUuid(engagements)}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("edit_item", {
            values: { item: $_("leave", { values: { n: 1 } }) },
          })
        )}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  </form>
{/await}
