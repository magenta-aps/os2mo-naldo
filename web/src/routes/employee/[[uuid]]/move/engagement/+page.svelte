<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import { enhance } from "$app/forms"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import type { SubmitFunction } from "./$types"
  import { EngagementsDocument, UpdateEngagementDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/Search.svelte"
  import {
    getEngagementTitlesAndUuid,
    getValidities,
    type EngagementTitleAndUuid,
  } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

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

  gql`
    query Engagements($uuid: [UUID!], $currentDate: DateTime!) {
      employees(filter: { uuids: $uuid }) {
        objects {
          current(at: $currentDate) {
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

    mutation UpdateEngagement($input: EngagementUpdateInput!, $date: DateTime!) {
      engagement_update(input: $input) {
        current(at: $date) {
          person {
            name
            uuid
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

  $: if (selectedOrgUnit) {
    ;(async () => {
      validities = await getValidities(selectedOrgUnit.uuid)
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
            const mutation = await graphQLClient().request(UpdateEngagementDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_move_item", {
                  values: {
                    item: $_("engagement", { values: { n: 0 } }),
                    name: mutation.engagement_update.current?.person?.[0].name,
                  },
                })
              ),
              uuid: mutation.engagement_update.current?.person?.[0].uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
  const updateEngagements = async (employeeUuid: string | undefined | null) => {
    const res = await graphQLClient().request(EngagementsDocument, {
      uuid: employeeUuid,
      currentDate: $date,
    })

    engagements = res.employees?.objects[0].current?.engagements
  }

  onMount(async () => {
    if ($page.params.uuid) {
      await updateEngagements($page.params.uuid)
    }
  })
</script>

<title>{$_("navigation.move_engagement")} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{$_("navigation.move_engagement")}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <DateInput
          startValue={$date}
          bind:value={$fromDate.value}
          errors={$fromDate.errors}
          title={capital($_("date.move_date"))}
          id="from"
          min={validities.from}
          max={validities.to}
          required={true}
        />
      </div>
      {#if $page.params.uuid}
        {#await graphQLClient().request( EngagementsDocument, { uuid: $page.params.uuid, currentDate: $date } )}
          <Input
            title="{capital($_('specify'))} {$_('employee', { values: { n: 1 } })}"
            id="employee-uuid"
            disabled
            placeholder="{capital($_('loading'))} {$_('employee', {
              values: { n: 1 },
            })}..."
            required={true}
          />
        {:then data}
          {@const startValueEmployee = data.employees?.objects[0].current}

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
        {/await}
      {:else}
        <Search
          type="employee"
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
      {/if}

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
</form>
