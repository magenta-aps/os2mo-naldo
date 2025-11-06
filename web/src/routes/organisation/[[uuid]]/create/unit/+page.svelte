<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import { gql } from "graphql-request"
  import { OrgUnitDocument, CreateOrgUnitDocument } from "./query.generated"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import type { FacetValidities } from "$lib/utils/classes"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import { getClasses } from "$lib/http/getClasses"
  import { getValidities } from "$lib/http/getValidities"

  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { MOConfig } from "$lib/stores/config"
  import { env } from "$lib/env"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  const orgUnitType = field("org_unit_type", "", [required()])
  const timePlanning = field("time_planning", "", [required()])
  let svelteForm = form(fromDate, name, orgUnitType)

  // This is needed, since `timePlanning` is required, but only used by some.
  $: if ($MOConfig) {
    if (
      $MOConfig.confdb_show_time_planning === "true" &&
      !env.PUBLIC_OPTIONAL_TIME_PLANNING
    ) {
      svelteForm = form(fromDate, name, orgUnitType, timePlanning)
    }
  }

  let parent: {
    uuid: string
    name: string
  }
  gql`
    query OrgUnit($uuid: [UUID!], $currentDate: DateTime!) {
      org_units(filter: { uuids: $uuid, from_date: null, to_date: null }) {
        objects {
          current(at: $currentDate) {
            name
            uuid
          }
        }
      }
    }

    mutation CreateOrgUnit($input: OrganisationUnitCreateInput!, $date: DateTime!) {
      org_unit_create(input: $input) {
        current(at: $date) {
          uuid
          name
        }
      }
    }
  `
  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  let facets: FacetValidities[]
  let abortController: AbortController
  $: {
    const params = {
      currentDate: $date,
      orgUuid: parent ? parent.uuid : null,
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

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(CreateOrgUnitDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_create", {
                  values: {
                    name: mutation.org_unit_create.current?.name,
                  },
                })
              ),
              uuid: mutation.org_unit_create.current?.uuid,
              type: "organisation",
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
      values: { item: $_("unit", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("unit", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded-sm">
    <div class="p-8">
      <div class="flex flex-row gap-6">
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
      {#if $page.params.uuid}
        {#await graphQLClient().request( OrgUnitDocument, { uuid: $page.params.uuid, currentDate: $date } ) then orgUnitData}
          {@const orgUnit = orgUnitData.org_units?.objects[0].current}
          <Search
            type="org-unit"
            title="{capital($_('specify'))} {$_('parent')}"
            id="parent-uuid"
            bind:value={parent}
            startValue={{
              uuid: orgUnit?.uuid ? orgUnit.uuid : undefined,
              name: orgUnit?.name ? orgUnit?.name : "",
            }}
          />
        {/await}
      {:else}
        <Search
          type="org-unit"
          title="{capital($_('specify'))} {$_('parent')}"
          id="parent-uuid"
          bind:value={parent}
        />
      {/if}
      <Breadcrumbs
        orgUnit={parent}
        emptyMessage="{capital(
          $name.value ? $name.value : $_('unit', { values: { n: 0 } })
        )} {$_('empty_breadcrumbs')}"
      />
      <Input
        title={capital($_("name"))}
        id="name"
        required={true}
        bind:value={$name.value}
        errors={$name.errors}
      />
      {#if facets}
        {#if $MOConfig && $MOConfig.confdb_show_level === "true"}
          <Select
            title={capital($_("org_unit_level"))}
            id="org-unit-level"
            iterable={filterClassesByFacetUserKey(facets, "org_unit_level")}
            isClearable={true}
          />
        {/if}
        {#if $MOConfig && $MOConfig.confdb_show_time_planning === "true"}
          <Select
            title={capital($_("time_planning"))}
            id="time-planning"
            bind:name={$timePlanning.value}
            errors={$timePlanning.errors}
            iterable={filterClassesByFacetUserKey(facets, "time_planning")}
            isClearable={true}
            required={!env.PUBLIC_OPTIONAL_TIME_PLANNING}
            on:clear={() => ($timePlanning.value = "")}
          />
        {/if}
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("org_unit_type"))}
            id="org-unit-type"
            bind:name={$orgUnitType.value}
            errors={$orgUnitType.errors}
            iterable={filterClassesByFacetUserKey(facets, "org_unit_type")}
            extra_classes="basis-1/2"
            isClearable={true}
            required={true}
            on:clear={() => ($orgUnitType.value = "")}
          />
          <Input
            title={capital($_("org_unit_number"))}
            placeholder={capital($_("fill_or_auto"))}
            id="org-unit-number"
            extra_classes="basis-1/2"
          />
        </div>
      {:else}
        <Skeleton />
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      {/if}
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("unit", { values: { n: 1 } }) },
        })
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
