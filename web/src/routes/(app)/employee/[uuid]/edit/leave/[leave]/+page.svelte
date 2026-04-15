<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import {
    LeaveAndFacetDocument,
    GetEngagementsDocument,
    UpdateLeaveDocument,
  } from "./query.generated"
  import {
    getEngagementTitlesAndUuid,
    type EngagementTitleAndUuid,
  } from "$lib/utils/display"
  import type { FacetValidities } from "$lib/utils/classes"
  import { getEngagementValidities } from "$lib/http/getValidities"
  import { getClasses } from "$lib/http/getClasses"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Search from "$lib/components/search/Search.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { normalizeLeave } from "$lib/utils/normalizeForm"

  let startDate: string = $date
  let toDate: string

  let selectedPerson: {
    uuid: string
    name: string
  }
  let selectedEngagement: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const leaveType = field("leave_type", "", [required()])
  const engagement = field("engagement", "", [required()])
  const svelteForm = form(fromDate, leaveType, engagement)

  gql`
    query LeaveAndFacet($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      leaves(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            engagement_response {
              uuid
              current(at: $fromDate) {
                validity {
                  from
                  to
                }
                org_unit_response {
                  uuid
                  current(at: $fromDate) {
                    name
                  }
                }
                job_function_response {
                  uuid
                  current(at: $fromDate) {
                    name
                  }
                }
              }
            }
            leave_type_response {
              uuid
              current(at: $fromDate) {
                user_key
                name
              }
            }
            validity {
              from
              to
            }
            person_response {
              uuid
              current(at: $fromDate) {
                name
                engagements(filter: { from_date: $fromDate, to_date: $toDate }) {
                  uuid
                  org_unit_response {
                    uuid
                    current(at: $fromDate) {
                      name
                    }
                  }
                  job_function_response {
                    uuid
                    current(at: $fromDate) {
                      name
                    }
                  }
                }
                validity {
                  from
                  to
                }
              }
            }
          }
        }
      }
    }

    query GetEngagements($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      engagements(
        filter: { employees: $uuid, from_date: $fromDate, to_date: $toDate }
      ) {
        objects {
          validities {
            org_unit_response {
              uuid
              current(at: $fromDate) {
                name
                user_key
              }
            }
            uuid
            job_function_response {
              uuid
              current(at: $fromDate) {
                user_key
                name
              }
            }
          }
        }
      }
    }

    mutation UpdateLeave($input: LeaveUpdateInput!, $date: DateTime!) {
      leave_update(input: $input) {
        current(at: $date) {
          person_response {
            uuid
            current(at: $date) {
              name
            }
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
            const mutation = await graphQLClient().request(UpdateLeaveDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit_item", {
                  values: {
                    item: $_("leave", { values: { n: 0 } }),
                    name: mutation.leave_update.current?.person_response?.current?.name,
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

  const updateEngagements = async (
    employeeUuid: string | undefined | null,
    fromDate: string,
    toDate: string
  ) => {
    const res = await graphQLClient().request(GetEngagementsDocument, {
      uuid: employeeUuid,
      fromDate: fromDate,
      toDate: toDate,
    })
    return (engagements = res.engagements?.objects.map((e) => e.validities[0]))
  }

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

  let facets: FacetValidities[]
  let engagements: EngagementTitleAndUuid[]
  let abortController: AbortController
  $: {
    // Abort the previous request if a new one is about to start
    if (abortController) abortController.abort()
    abortController = new AbortController()

    const params = {
      currentDate: startDate,
      orgUuid: null,
      facetUserKeys: ["leave_type"],
    }

    ;(async () => {
      try {
        facets = await getClasses(params, abortController.signal)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err)
        }
      }
      await updateEngagements($page.params.uuid, startDate, toDate)
    })()
  }

  let initialLeave: any = null
  let hasChanges = false
  $: if (initialLeave) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged =
      $leaveType.value !== initialLeave.leave_type ||
      selectedEngagement?.uuid !== initialLeave.engagement

    const toDateExtended =
      toDate === "" ? initialLeave.to !== null : toDate > (initialLeave.to ?? null)
    hasChanges = editableChanged || toDateExtended
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

{#await graphQLClient().request( LeaveAndFacetDocument, { uuid: $page.params.leave, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to") } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
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
  {@const person = {
    uuid: leave.person_response.uuid,
    name: leave.person_response.current?.name ?? "",
  }}
  {@const engagementStartValue = getEngagementTitlesAndUuid([
    {
      uuid: leave.engagement_response.uuid,
      job_function_response: leave.engagement_response.current?.job_function_response,
      org_unit_response: leave.engagement_response.current?.org_unit_response,
    },
  ])[0]}
  {#if !initialLeave}
    {@html (() => {
      initialLeave = normalizeLeave(leave)
      return ""
    })()}
  {/if}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={startDate}
            bind:validationValue={$fromDate.value}
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

        <Search
          type="employee"
          bind:value={selectedPerson}
          startValue={{
            uuid: person.uuid,
            name: person.name,
          }}
          disabled
          required={true}
        />
        {#if facets}
          <Select
            startValue={leave.leave_type_response?.current
              ? {
                  uuid: leave.leave_type_response.uuid,
                  name: leave.leave_type_response.current.name,
                  user_key: leave.leave_type_response.current.user_key,
                }
              : undefined}
            title={capital($_("leave_type"))}
            id="leave-type-uuid"
            bind:name={$leaveType.value}
            errors={$leaveType.errors}
            iterable={filterClassesByFacetUserKey(facets, "leave_type")}
            required={true}
          />
        {/if}

        {#if engagements && engagements.length}
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
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("leave", { values: { n: 1 } }) },
          })
        )}
        disabled={!hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/employee/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
