<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { GetOrgUnitAndFacetsDocument, UpdateOrgUnitDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"

  let toDate: string
  let parent: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  const orgUnitType = field("org_unit_type", "", [required()])
  const orgUnitLevel = field("org_unit_level", "", [required()])
  const svelteForm = form(fromDate, name, orgUnitType, orgUnitLevel)

  gql`
    query GetOrgUnitAndFacets($uuid: [UUID!], $fromDate: DateTime) {
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
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            name
            parent {
              uuid
              name
              validity {
                from
                to
              }
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
  `

  gql`
    mutation UpdateOrgUnit($input: OrganisationUnitUpdateInput!) {
      org_unit_update(input: $input) {
        uuid
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
            const mutation = await graphQLClient().request(UpdateOrgUnitDocument, {
              input: result.data,
            })

            $success = {
              message: `Organisationsenheden ${$name.value} redigeres fra d. ${$fromDate.value}`,
              uuid: mutation.org_unit_update.uuid,
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

{#await graphQLClient().request( GetOrgUnitAndFacetsDocument, { uuid: $page.params.uuid, fromDate: $date } )}
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
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const orgUnit = data.org_units.objects[0].objects[0]}
  {@const facets = data.facets.objects}
  {@const minDate = orgUnit.parent?.validity.from.split("T")[0]}
  {@const maxDate = orgUnit.parent?.validity.to?.split("T")[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
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
            title={capital($_("date.end_date"))}
            startValue={orgUnit.validity.to ? orgUnit.validity.to.split("T")[0] : null}
            id="to"
            min={$fromDate.value}
            max={maxDate ? maxDate : null}
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

        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("org_unit_level"))}
            id="org-level"
            bind:name={$orgUnitLevel.value}
            errors={$orgUnitLevel.errors}
            startValue={orgUnit.org_unit_level ? orgUnit.org_unit_level : undefined}
            on:clear={() => ($orgUnitLevel.value = "")}
            extra_classes="basis-1/2"
            iterable={getClassesByFacetUserKey(facets, "org_unit_level")}
            isClearable={true}
            required={true}
          />
          <Select
            title={capital($_("org_unit_type"))}
            id="org-type"
            bind:name={$orgUnitType.value}
            errors={$orgUnitType.errors}
            startValue={orgUnit.unit_type ? orgUnit.unit_type : undefined}
            on:clear={() => ($orgUnitType.value = "")}
            extra_classes="basis-1/2"
            iterable={getClassesByFacetUserKey(facets, "org_unit_type")}
            isClearable={true}
            required={true}
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("edit_item", {
            values: { item: $_("unit", { values: { n: 1 } }) },
          })
        )}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${orgUnit.uuid}`)}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  </form>
{/await}
