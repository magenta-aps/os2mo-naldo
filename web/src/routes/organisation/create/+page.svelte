<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { gql } from "graphql-request"
  import { GetOrgUnitAndFacetsDocument, CreateOrgUnitDocument } from "./query.generated"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/search.svelte"
  import { getUuidFromHash } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"
  import { MOConfig } from "$lib/stores/config"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  const orgUnitType = field("org_unit_type", "", [required()])
  const orgUnitLevel = field("org_unit_level", "", [required()])
  const svelteForm = form(fromDate, name, orgUnitType, orgUnitLevel)

  let parent: {
    uuid: string
    name: string
  }

  const urlHashOrgUnitUuid = getUuidFromHash($page.url.hash)
  const includeOrgUnit = urlHashOrgUnitUuid ? true : false
  gql`
    query GetOrgUnitAndFacets(
      $uuid: [UUID!]
      $fromDate: DateTime
      $includeOrgUnit: Boolean!
    ) {
      facets(filter: { user_keys: ["org_unit_level", "org_unit_type"] }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              name
              uuid
              user_key
            }
          }
        }
      }
      ...getOrgUnit
    }

    fragment getOrgUnit on Query {
      org_units(filter: { uuids: $uuid, from_date: $fromDate })
        @include(if: $includeOrgUnit) {
        objects {
          objects {
            name
            uuid
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation CreateOrgUnit($input: OrganisationUnitCreateInput!) {
      org_unit_create(input: $input) {
        objects {
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
            })
            $success = {
              message: capital(
                $_("success_create", {
                  values: {
                    item: $_("org_unit", { values: { n: 0 } }),
                    name: undefined,
                  },
                })
              ),
              // TODO: Fix `parent` redirect, when `/organisation` is not a thing anymore
              uuid: mutation.org_unit_create.objects[0]?.uuid
                ? mutation.org_unit_create.objects[0].uuid
                : parent
                ? parent.uuid
                : "",
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

<!-- LOOKATME: FIXME: SOMETHING: Form here or inside await? -->
<form method="post" class="mx-6" use:enhance={handler}>
  {#await graphQLClient().request( GetOrgUnitAndFacetsDocument, { uuid: urlHashOrgUnitUuid, fromDate: $date, includeOrgUnit: includeOrgUnit } )}
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <!-- TODO: Make Skeleton better for Breadcrumbs? -->
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
    {@const orgUnit = data.org_units?.objects[0].objects[0]}
    {@const facets = data.facets.objects}
    <!-- TODO: these dates needs to be dynamically linked to the `parent.validity` -->
    {@const minDate = orgUnit?.validity.from.split("T")[0]}
    {@const maxDate = orgUnit?.validity.to?.split("T")[0]}

    <div class="sm:w-full md:w-3/4 xl:w-1/2 mb-6 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title={capital($_("date.start_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>
        {#if orgUnit}
          <Search
            type="org-unit"
            title="{capital($_('specify'))} {$_('parent')}"
            id="parent-uuid"
            bind:value={parent}
            startValue={{
              uuid: orgUnit.uuid,
              name: orgUnit.name,
            }}
          />
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
        {#if $MOConfig.confdb_show_level === "true"}
          <Select
            title={capital($_("org_unit_level"))}
            id="org-unit-level"
            bind:name={$orgUnitLevel.value}
            errors={$orgUnitLevel.errors}
            iterable={getClassesByFacetUserKey(facets, "org_unit_level")}
            isClearable={true}
            required={true}
            on:clear={() => ($orgUnitLevel.value = "")}
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
