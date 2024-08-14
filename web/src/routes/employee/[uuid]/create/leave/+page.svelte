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
  import { CreateLeaveDocument, LeaveAndEmployeeDocument } from "./query.generated"
  import { getEngagementTitlesAndUuid } from "$lib/util/helpers"
  import Search from "$lib/components/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities } from "$lib/util/helpers"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const leaveType = field("leave_type", "", [required()])
  const engagement = field("engagement", "", [required()])
  const svelteForm = form(fromDate, leaveType, engagement)

  gql`
    query LeaveAndEmployee($uuid: [UUID!], $currentDate: DateTime!) {
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
      employees(filter: { uuids: $uuid, from_date: null, to_date: null }) {
        objects {
          current {
            uuid
            name
            engagements {
              org_unit {
                name
                user_key
              }
              uuid
              job_function {
                user_key
                name
              }
            }
          }
          validities {
            validity {
              from
              to
            }
          }
        }
      }
    }
    mutation CreateLeave($input: LeaveCreateInput!, $date: DateTime!) {
      leave_create(input: $input) {
        current(at: $date) {
          person {
            name
          }
          leave_type {
            name
          }
        }
      }
    }
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(CreateLeaveDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("leave", { values: { n: 0 } }),
                    name: mutation.leave_create.current?.person?.[0].name,
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
    $_("create_item", {
      values: { item: $_("leave", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("leave", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( LeaveAndEmployeeDocument, { uuid: $page.params.uuid, currentDate: $date } )}
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
  {@const facets = data.facets.objects}
  {@const employee = data.employees.objects[0].current}
  {@const validities = getMinMaxValidities(data.employees.objects[0].validities)}
  {@const engagements = employee?.engagements}

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
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>

        <Select
          title={capital($_("leave_type"))}
          id="leave-type-uuid"
          bind:name={$leaveType.value}
          errors={$leaveType.errors}
          iterable={getClassesByFacetUserKey(facets, "leave_type")}
          required={true}
        />
        <!-- FIXME: Either allow undefined or use `validities` when datepickers -->
        <!-- use org_unit validities instead of employee -->
        <Search
          type="employee"
          startValue={{
            uuid: employee ? employee.uuid : undefined,
            name: employee ? employee.name : "",
          }}
          disabled
          required={true}
        />
        <!-- FIXME: Either allow undefined or use `validities` when datepickers -->
        <!-- use org_unit validities instead of employee -->
        <Select
          title={capital($_("engagements", { values: { n: 2 } }))}
          id="engagement-uuid"
          bind:name={$engagement.value}
          errors={$engagement.errors}
          iterable={getEngagementTitlesAndUuid(engagements ? engagements : [])}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("create_item", {
            values: { item: $_("leave", { values: { n: 1 } }) },
          })
        )}
      </button>
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
