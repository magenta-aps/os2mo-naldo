<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import {
    CreateLeaveDocument,
    LeaveTypeAndEmployeeDocument,
    GetEmployeeDocument,
  } from "./query.generated"
  import {
    getEngagementTitlesAndUuid,
    type EngagementTitleAndUuid,
    getUuidFromHash,
    getMinMaxValidities,
  } from "$lib/util/helpers"
  import Search from "$lib/components/search.svelte"
  import { onMount } from "svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const employeeField = field("employee", "", [required()])
  const leaveType = field("leave_type", "", [required()])
  const engagement = field("engagement", "", [required()])
  const svelteForm = form(fromDate, employeeField, leaveType, engagement)

  let employee: {
    uuid: string
    name: string
  }
  let engagements: EngagementTitleAndUuid[] | undefined
  gql`
    query LeaveTypeAndEmployee($uuid: [UUID!], $includeEmployee: Boolean!) {
      facets(filter: { user_keys: ["leave_type"] }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              uuid
              user_key
              name
            }
          }
        }
      }
      employees(filter: { uuids: $uuid, from_date: null, to_date: null })
        @include(if: $includeEmployee) {
        objects {
          current {
            uuid
            name
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

    query GetEmployee($uuid: [UUID!], $includeEmployee: Boolean!) {
      employees(filter: { uuids: $uuid, from_date: null, to_date: null })
        @include(if: $includeEmployee) {
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

    mutation CreateLeave($input: LeaveCreateInput!) {
      leave_create(input: $input) {
        objects {
          person {
            name
            uuid
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
            })
            $success = {
              message: capital(
                $_("success_create", {
                  values: {
                    item: $_("leave", { values: { n: 0 } }),
                    name: mutation.leave_create.objects[0]?.person?.[0].name,
                  },
                })
              ),
              uuid: mutation.leave_create.objects[0].person[0].uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  const urlHashEmployeeUuid = getUuidFromHash($page.url.hash)
  const includeEmployee = urlHashEmployeeUuid ? true : false

  async function updateEngagements(employeeUuid: string | undefined | null) {
    const res = await graphQLClient().request(GetEmployeeDocument, {
      uuid: employeeUuid,
      includeEmployee: employeeUuid ? true : false,
    })
    engagements = res.employees?.objects[0].current?.engagements
  }

  onMount(async () => {
    await updateEngagements(urlHashEmployeeUuid)
  })
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

<!-- LOOKATME: FIXME: SOMETHING: Form here or inside await? -->
<form method="post" class="mx-6" use:enhance={handler}>
  {#await graphQLClient().request( LeaveTypeAndEmployeeDocument, { uuid: urlHashEmployeeUuid, includeEmployee: includeEmployee } )}
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
  {:then data}
    {@const facets = data.facets.objects}
    {@const startValueEmployee = data.employees?.objects[0].current}
    {@const validities = getMinMaxValidities(data.employees?.objects[0].validities)}

    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <!-- TODO: dynamically change dates depending on which engagement has been chosen -->
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
            min={$fromDate.value}
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
        <Search
          type="employee"
          startValue={startValueEmployee
            ? {
                uuid: startValueEmployee.uuid,
                name: startValueEmployee.name,
              }
            : undefined}
          bind:value={employee}
          bind:name={$employeeField.value}
          errors={$employeeField.errors}
          on:change={() => updateEngagements(employee.uuid)}
          on:clear={() => {
            $employeeField.value = ""
            $engagement.value = ""
            engagements = undefined
          }}
          required={true}
        />
        {#if engagements && engagements.length}
          {#key engagements}
            <Select
              title={capital($_("engagements", { values: { n: 2 } }))}
              id="engagement-uuid"
              bind:name={$engagement.value}
              errors={$engagement.errors}
              startValue={getEngagementTitlesAndUuid(engagements)[0]}
              iterable={getEngagementTitlesAndUuid(engagements)}
              required={true}
            />
          {/key}
        {:else}
          <Select
            title={capital($_("engagements", { values: { n: 2 } }))}
            id="engagement-uuid"
            bind:name={$engagement.value}
            errors={$engagement.errors}
            disabled
            required={true}
          />
        {/if}
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
        on:click={() => history.back()}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  {/await}
</form>
