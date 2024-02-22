<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import Error from "$lib/components/alerts/error.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import type { SubmitFunction } from "./$types"
  import { EngagementsDocument, UpdateEngagementDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/search.svelte"
  import {
    getEngagementTitlesAndUuid,
    getUuidFromHash,
    type EngagementTitleAndUuid,
  } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"

  let selectedOrgUnit: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const employeeField = field("employee", "", [required()])
  const engagement = field("engagement", "", [required()])
  const orgUnitField = field("org_unit", "", [required()])
  const svelteForm = form(fromDate, employeeField, engagement, orgUnitField)

  let employee: {
    uuid: string
    name: string
  }
  let engagements: EngagementTitleAndUuid[] | undefined

  const urlHashEmployeeUuid = getUuidFromHash($page.url.hash)
  const includeEmployee = urlHashEmployeeUuid ? true : false

  gql`
    query Engagements(
      $uuid: [UUID!]
      $fromDate: DateTime!
      $includeEngagement: Boolean!
    ) {
      ...getEngagements
    }

    fragment getEngagements on Query {
      employees(filter: { uuids: $uuid, from_date: $fromDate })
        @include(if: $includeEngagement) {
        objects {
          objects {
            uuid
            name
            engagements {
              uuid
              org_unit {
                name
              }
              job_function {
                name
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

    mutation UpdateEngagement($input: EngagementUpdateInput!) {
      engagement_update(input: $input) {
        objects {
          uuid
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
            const mutation = await graphQLClient().request(UpdateEngagementDocument, {
              input: result.data,
            })
            $success = {
              message: capital(
                $_("success_move", {
                  values: {
                    item: $_("engagement", { values: { n: 0 } }),
                    name: mutation.engagement_update.objects[0]?.person?.[0].name,
                  },
                })
              ),
              uuid: mutation.engagement_update.objects[0].person[0].uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
  async function updateEngagements(employeeUuid: string | undefined | null) {
    const res = await graphQLClient().request(EngagementsDocument, {
      uuid: employeeUuid,
      fromDate: $date,
      includeEngagement: employeeUuid ? true : false,
    })
    engagements = res.employees?.objects[0].objects[0].engagements
  }

  onMount(async () => {
    await updateEngagements(urlHashEmployeeUuid)
  })
</script>

<title>{$_("navigation.move_engagement")} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{$_("navigation.move_engagement")}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<!-- LOOKATME: FIXME: SOMETHING: Form here or inside await? -->
<form method="post" class="mx-6" use:enhance={handler}>
  {#await graphQLClient().request( EngagementsDocument, { uuid: urlHashEmployeeUuid, fromDate: $date, includeEngagement: includeEmployee } )}
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  {:then data}
    {@const startValueEmployee = data.employees?.objects[0].objects[0]}
    {@const minDate = startValueEmployee?.engagements[0]?.validity.from}

    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.move_date"))}
            id="from"
            min={minDate ? minDate : null}
            required={true}
          />
        </div>
        <Search
          type="employee"
          title={capital($_("employee", { values: { n: 1 } }))}
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
        <Search
          type="org-unit"
          title="{capital($_('move'))} {$_('to')}"
          bind:name={$orgUnitField.value}
          errors={$orgUnitField.errors}
          on:clear={() => ($orgUnitField.value = "")}
          bind:value={selectedOrgUnit}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{$_("navigation.move_engagement")}</button
      >
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
