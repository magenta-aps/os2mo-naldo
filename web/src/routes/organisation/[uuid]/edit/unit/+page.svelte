<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { GetOrgUnitDocument, UpdateOrgUnitDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { FacetValidities } from "$lib/utils/classes"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getClasses } from "$lib/http/getClasses"
  import { getValidities } from "$lib/http/getValidities"
  import { normalizeOrganisation } from "$lib/utils/normalizeForm"

  gql`
    query GetOrgUnit($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            name
            user_key
            parent(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              name
            }
            time_planning {
              name
              uuid
              user_key
            }
            unit_type {
              uuid
              user_key
              name
            }
            org_unit_level {
              uuid
              user_key
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

    mutation UpdateOrgUnit($input: OrganisationUnitUpdateInput!, $date: DateTime!) {
      org_unit_update(input: $input) {
        current(at: $date) {
          name
        }
      }
    }
  `

  let startDate: string = $date
  let toDate: string
  let parent: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  const orgUnitType = field("org_unit_type", "", [required()])
  const orgUnitLevel = field("org_unit_level", "", [])
  const timePlanning = field("time_planning", "", [])
  const orgUnitNumber = field("org_unit_number", "", [])
  let svelteForm = form(
    fromDate,
    name,
    orgUnitType,
    orgUnitLevel,
    orgUnitNumber,
    timePlanning
  )

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateOrgUnitDocument, {
              input: result.data,
              date: result.data.validity.from,
            })

            $success = {
              message: capital(
                $_("success_edit", {
                  values: {
                    name: mutation.org_unit_update.current?.name,
                  },
                })
              ),
              uuid: $page.params.uuid,
              type: "organisation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  let facets: FacetValidities[]
  let abortController: AbortController

  $: {
    const params = {
      currentDate: startDate,
      orgUuid: parent?.uuid ?? $page.params.uuid ?? null,
      facetUserKeys: ["org_unit_level", "org_unit_type", "time_planning"],
    }

    // Abort the previous request if a new one is about to start
    if (abortController) {
      abortController.abort() // Cancel any in-progress request
    }

    abortController = new AbortController()
    ;(async () => {
      validities = parent ? await getValidities(parent.uuid) : { from: null, to: null }
      try {
        const result = await getClasses(params, abortController.signal)
        facets = result // Update facets if the request is successful
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err) // Handle other errors
        }
      }
    })()
  }

  let initialOrganisation: any = null
  let hasChanges = false
  $: if (initialOrganisation) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged =
      $name.value !== initialOrganisation.name ||
      parent?.uuid !== initialOrganisation.parent ||
      $orgUnitType.value !== initialOrganisation.unit_type ||
      (env.PUBLIC_SHOW_ORG_UNIT_LEVEL &&
        $orgUnitLevel.value !== initialOrganisation.org_unit_level) ||
      (env.PUBLIC_SHOW_TIME_PLANNING &&
        $timePlanning.value !== initialOrganisation.time_planning) ||
      $orgUnitNumber.value !== initialOrganisation.user_key

    const toDateExtended =
      toDate === ""
        ? initialOrganisation.to !== null
        : toDate > (initialOrganisation.to ?? null)
    hasChanges = editableChanged || toDateExtended
  }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("org_unit", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("org_unit", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( GetOrgUnitDocument, { uuid: $page.params.uuid, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to") } )}
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
        <Skeleton />
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const orgUnit = data.org_units.objects[0].validities[0]}
  {#if !initialOrganisation}
    {@html (() => {
      initialOrganisation = normalizeOrganisation(orgUnit)
      return ""
    })()}
  {/if}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
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
            startValue={orgUnit.validity.to ? orgUnit.validity.to.split("T")[0] : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <Search
          title="{capital($_('specify'))} {$_('parent')}"
          type="org-unit"
          startValue={orgUnit.parent
            ? {
                uuid: orgUnit.parent.uuid,
                name: orgUnit.parent.name,
              }
            : undefined}
          bind:value={parent}
        />
        <Breadcrumbs
          orgUnit={parent}
          emptyMessage="{capital(
            $name.value ? $name.value : $_('unit', { values: { n: 0 } })
          )} {$_('empty_breadcrumbs')}"
        />
        <Input
          title={capital($_("name"))}
          id="name"
          bind:value={$name.value}
          errors={$name.errors}
          startValue={orgUnit.name}
          required={true}
        />
        {#if facets}
          {#if env.PUBLIC_SHOW_TIME_PLANNING}
            <Select
              title={capital($_("time_planning"))}
              id="time-planning"
              bind:name={$timePlanning.value}
              errors={$timePlanning.errors}
              startValue={orgUnit.time_planning ? orgUnit.time_planning : undefined}
              on:clear={() => ($timePlanning.value = "")}
              iterable={filterClassesByFacetUserKey(facets, "time_planning")}
              isClearable={true}
            />
          {/if}
          <div class="flex flex-row gap-6">
            {#if env.PUBLIC_SHOW_ORG_UNIT_LEVEL}
              <Select
                title={capital($_("org_unit_level"))}
                id="org-level"
                bind:name={$orgUnitLevel.value}
                errors={$orgUnitLevel.errors}
                startValue={orgUnit.org_unit_level ? orgUnit.org_unit_level : undefined}
                on:clear={() => ($orgUnitLevel.value = "")}
                extra_classes="basis-1/2"
                iterable={filterClassesByFacetUserKey(facets, "org_unit_level")}
                isClearable={true}
              />
            {/if}
            <Select
              title={capital($_("org_unit_type"))}
              id="org-type"
              bind:name={$orgUnitType.value}
              errors={$orgUnitType.errors}
              startValue={orgUnit.unit_type ? orgUnit.unit_type : undefined}
              on:clear={() => ($orgUnitType.value = "")}
              extra_classes="basis-1/2"
              iterable={filterClassesByFacetUserKey(facets, "org_unit_type")}
              isClearable={true}
              required={true}
            />
          </div>
        {/if}
        <Input
          title={capital($_("org_unit_number"))}
          id="org-unit-number"
          bind:value={$orgUnitNumber.value}
          errors={$orgUnitNumber.errors}
          startValue={orgUnit.user_key}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("unit", { values: { n: 1 } }) },
          })
        )}
        disabled={!hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/organisation/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
