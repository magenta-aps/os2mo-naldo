<script lang="ts">
  import { Temporal } from "temporal-polyfill"
  import type { ValidityBounds } from "$lib/utils/validities"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import StartDateInput from "$lib/components/forms/shared/StartDateInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { success, error } from "$lib/stores/alert"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import {
    ExplicitManagerEngagementsDocument,
    SetExplicitManagersDocument,
    type ExplicitManagerEngagementsQuery,
  } from "./query.generated"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import EngagementChecklist from "$lib/components/forms/shared/EngagementChecklist.svelte"
  import { createQuery } from "$lib/http/query"
  import { getValidities } from "$lib/http/getValidities"
  import { getMinMaxValidities } from "$lib/utils/validities"
  import { moValidityFrom, toMO } from "$lib/utils/date"
  import ExplicitManagerSelect from "$lib/components/forms/shared/ExplicitManagerSelect.svelte"
  import type { ClassValue } from "$lib/components/forms/entity/types"
  import Icon from "@iconify/svelte"
  import personCheckOutlineRounded from "@iconify/icons-material-symbols/person-check-outline-rounded"

  type Engagements = ExplicitManagerEngagementsQuery["engagements"]["objects"][0]

  gql`
    query ExplicitManagerEngagements($org_unit: [UUID!], $currentDate: DateTime) {
      engagements(filter: { org_units: $org_unit, from_date: $currentDate }) {
        objects {
          current(at: $currentDate) {
            uuid
            person_response {
              uuid
              current(at: $currentDate) {
                name
              }
            }
            explicit_manager {
              current(at: $currentDate) {
                person_response {
                  current(at: $currentDate) {
                    name
                  }
                }
              }
            }
          }
          validities(start: null, end: null) {
            validity {
              from
              to
            }
          }
        }
      }
    }
    mutation SetExplicitManagers($input: [EngagementUpdateInput!]!, $date: DateTime!) {
      engagements_update(input: $input) {
        current(at: $date) {
          uuid
        }
      }
    }
  `

  let startDate: Temporal.ZonedDateTime | null | undefined = moValidityFrom($date)
  // FIXME: `handler: SubmitFunction` gives TS-error:
  // Argument of type 'SubmitFunction' is not assignable to parameter of type 'SubmitFunction<Record<string, unknown> | undefined, never>'.
  // Ignored for now, by removing typing and typing result to `any`.
  const handler =
    () =>
    async ({ result }: any) => {
      // Await the validation, before we continue
      await svelteForm.validate()

      if ($svelteForm.valid) {
        if (result.type === "success" && result.data && result.data.length) {
          try {
            await graphQLClient().request(SetExplicitManagersDocument, {
              input: result.data,
              date: result.data[0].validity.from,
            })

            $success = {
              message: capital(
                $_(
                  explicitManager
                    ? "success_explicit_managers"
                    : "success_remove_explicit_managers"
                )
              ),
              uuid: orgUnit.uuid,
              type: "organisation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  // Datepicker bounds for the selected org unit. See the employee edit
  // engagement form for the query pattern and its trade-offs.
  const validities = createQuery<ValidityBounds>({ from: null, to: null })
  $: if (orgUnit?.uuid) {
    const orgUnitUuid = orgUnit.uuid
    validities.run((signal) => getValidities(orgUnitUuid, signal))
  } else {
    validities.run(async () => ({ from: null, to: null }))
  }

  const engagements = createQuery<Engagements[]>([])
  // Only fetch when a start date and an org unit are set; the list resets
  // whenever either is cleared.
  $: if (startDate && orgUnit?.uuid) {
    const orgUnitUuid = orgUnit.uuid
    engagements.run(async (signal) => {
      const res = await graphQLClient(signal).request(
        ExplicitManagerEngagementsDocument,
        {
          org_unit: orgUnitUuid,
          currentDate: startDate,
        }
      )
      return res.engagements?.objects ?? []
    })
  } else {
    engagements.run(async () => [])
  }

  const fromDate = field<Temporal.ZonedDateTime | null | undefined>("from", undefined, [
    required(),
  ])
  const orgUnitField = field("org_unit", "", [required()])
  const svelteForm = form(fromDate, orgUnitField)

  let orgUnit: {
    uuid: string
    name: string
  }
  let explicitManagerPerson: { uuid: string; name: string } | undefined
  let explicitManager: ClassValue | undefined
  let selectedEngagements: string[] = []

  // The engagement's current end, kept as it is.
  const endOf = (validities: Parameters<typeof getMinMaxValidities>[0]) => {
    const { to } = getMinMaxValidities(validities)
    return to ? toMO(to) : ""
  }

  $: rows = ($engagements.data ?? []).flatMap(({ current, validities }) =>
    current
      ? [
          {
            uuid: current.uuid,
            name: current.person_response.current?.name ?? current.person_response.uuid,
            end: endOf(validities),
            explicitManager: current.explicit_manager,
          },
        ]
      : []
  )
</script>

<title>{capital($_("navigation.explicit_managers"))} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{capital($_("navigation.explicit_managers"))}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<!-- FIXME: handler gives TS-error, because type is `SubmitFunction<Record<string, unknown> | undefined, never>`  -->
<!-- Instead of `SubmitFunction`. This is ignored by typing it to `any`. -->
<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <StartDateInput
          bind:value={startDate}
          bind:validationValue={$fromDate.value}
          errors={$fromDate.errors}
          title={capital($_("date.start_date"))}
          id="from"
          min={$validities.data?.from}
          max={$validities.data?.to}
          required={true}
        />
      </div>
      <div class="flex flex-row gap-6">
        <Search
          type="org-unit"
          at={startDate}
          bind:value={orgUnit}
          bind:name={$orgUnitField.value}
          errors={$orgUnitField.errors}
          on:clear={() => {
            $orgUnitField.value = ""
          }}
          required={true}
        />
      </div>
      <div class="text-base-content pb-3">
        {#if $engagements.error}
          <p class="text-sm text-error">
            {capital(
              $_($engagements.data?.length ? "load_error_options" : "load_error")
            )}
          </p>
        {/if}
        {#if rows.length}
          <EngagementChecklist
            engagements={rows}
            bind:selected={selectedEngagements}
            let:engagement
          >
            {#if engagement.explicitManager}
              <span
                class="label-text text-base-content flex items-center gap-1"
                title={capital($_("explicit_manager"))}
              >
                <Icon icon={personCheckOutlineRounded} width="16" height="16" />
                {engagement.explicitManager.current?.person_response?.current?.name ??
                  capital($_("vacant"))}
              </span>
            {/if}
          </EngagementChecklist>
        {:else}
          <Select
            title={capital($_("engagements", { values: { n: 2 } }))}
            id="engagement-uuid"
            disabled
            required={true}
          />
        {/if}
      </div>
      <ExplicitManagerSelect
        bind:person={explicitManagerPerson}
        bind:value={explicitManager}
        at={startDate}
      />
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <!-- Without a manager role the submit unsets it, so the label says so. -->
    <Button
      type="submit"
      title={capital(
        $_(
          explicitManager
            ? "navigation.explicit_managers"
            : "navigation.remove_explicit_managers"
        )
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      on:click={() => history.back()}
    />
  </div>
  <Error />
</form>
