<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { enhance } from "$app/forms"
  import { gql } from "graphql-request"
  import {
    OrgUnitDocument,
    FacetsDocument,
    CreateOrgUnitDocument,
  } from "./query.generated"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/Search.svelte"
  import { getMinMaxValidities, getUuidFromHash } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { MOConfig } from "$lib/stores/config"
  import { env } from "$env/dynamic/public"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  const orgUnitType = field("org_unit_type", "", [required()])
  const timePlanning = field("time_planning", "", [required()])
  let svelteForm = form(fromDate, name, orgUnitType)

  // This is needed, since `timePlanning` is required, but only used by some.
  if (
    $MOConfig &&
    $MOConfig.confdb_show_time_planning === "true" &&
    env.PUBLIC_OPTIONAL_TIME_PLANNING !== "true"
  ) {
    svelteForm = form(fromDate, name, orgUnitType, timePlanning)
  }

  let parent: {
    uuid: string
    name: string
  }

  const parentUuid = $page.params.uuid
  const includeOrgUnit = parentUuid ? true : false
  console.log($page.params.uuid)

  gql`
    query Facets($currentDate: DateTime!) {
      facets(
        filter: { user_keys: ["org_unit_level", "org_unit_type", "time_planning"] }
      ) {
        objects {
          validities {
            uuid
            user_key
            classes(filter: { from_date: $currentDate }) {
              name
              uuid
              user_key
            }
          }
        }
      }
    }

    query OrgUnit($uuid: [UUID!], $currentDate: DateTime!) {
      org_units(filter: { uuids: $uuid, from_date: null, to_date: null }) {
        objects {
          current(at: $currentDate) {
            name
            uuid
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

    mutation CreateOrgUnit($input: OrganisationUnitCreateInput!, $date: DateTime!) {
      org_unit_create(input: $input) {
        current(at: $date) {
          uuid
          name
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
  {#await graphQLClient().request(FacetsDocument, { currentDate: $date })}
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
        <Skeleton />
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  {:then data}
    {@const facets = data.facets.objects}
    <!-- TODO: these dates needs to be dynamically linked to the `parent.validity` -->

    <div class="sm:w-full md:w-3/4 xl:w-1/2 mb-6 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.move_date"))}
            id="from"
            max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : undefined}
            max={undefined}
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
        {#if $MOConfig && $MOConfig.confdb_show_level === "true"}
          <Select
            title={capital($_("org_unit_level"))}
            id="org-unit-level"
            iterable={getClassesByFacetUserKey(facets, "org_unit_level")}
            isClearable={true}
          />
        {/if}
        {#if $MOConfig && $MOConfig.confdb_show_time_planning === "true"}
          <Select
            title={capital($_("time_planning"))}
            id="time-planning"
            bind:name={$timePlanning.value}
            errors={$timePlanning.errors}
            iterable={getClassesByFacetUserKey(facets, "time_planning")}
            isClearable={true}
            required={env.PUBLIC_OPTIONAL_TIME_PLANNING !== "true"}
            on:clear={() => ($timePlanning.value = "")}
          />
        {/if}
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("org_unit_type"))}
            id="org-unit-type"
            bind:name={$orgUnitType.value}
            errors={$orgUnitType.errors}
            iterable={getClassesByFacetUserKey(facets, "org_unit_type")}
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
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("create_item", {
            values: { item: $_("unit", { values: { n: 1 } }) },
          })
        )}</button
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
