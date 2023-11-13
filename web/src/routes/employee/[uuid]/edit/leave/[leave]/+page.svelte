<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
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
  import { getEngagementTitlesAndUuid } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Search from "$lib/components/search.svelte"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const leaveType = field("leave_type", "", [required()])
  const engagement = field("engagement", "", [required()])
  const svelteForm = form(fromDate, leaveType, engagement)

  gql`
    query LeaveAndFacet($uuid: [UUID!], $fromDate: DateTime) {
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
      leaves(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
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

    mutation UpdateLeave($input: LeaveUpdateInput!) {
      leave_update(input: $input) {
        objects {
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
            const mutation = await graphQLClient().request(UpdateLeaveDocument, {
              input: result.data,
            })
            $success = {
              message: `Orloven ${
                mutation.leave_update.objects[0].person
                  ? `for ${mutation.leave_update.objects[0].person[0].name}`
                  : ""
              } redigeres fra d. ${$fromDate.value}`,
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

{#await graphQLClient().request( LeaveAndFacetDocument, { uuid: $page.params.leave, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const leave = data.leaves.objects[0].objects[0]}
  {@const facets = data.facets.objects}
  {@const minDate = leave.engagement.validity.from.split("T")[0]}
  {@const maxDate = leave.engagement.validity?.to?.split("T")[0]}
  {@const engagements = leave.person[0].engagements}
  {@const employee = leave.person[0]}
  {@const engagementStartValue = getEngagementTitlesAndUuid([leave.engagement])[0]}

  <title>Rediger orlov | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger orlov</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <!-- TODO: Update min/max depending on chosen engagement -->
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={leave.validity.to ? leave.validity.to.split("T")[0] : null}
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>

        <Select
          startValue={leave.leave_type}
          title="Orlovstype"
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
          title="Engagementer"
          id="engagement-uuid"
          startValue={engagementStartValue}
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
        >Rediger orlov</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
