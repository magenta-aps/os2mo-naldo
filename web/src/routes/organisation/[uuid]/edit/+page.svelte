<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import SelectNew from "$lib/components/forms/shared/selectNew.svelte"
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

  let toDate: string
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

{#await graphQLClient().request( GetOrgUnitAndFacetsDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const orgUnit = data.org_units.objects[0].objects[0]}
  {@const facets = data.facets.objects}
  {@const minDate = orgUnit.parent?.validity.from.split("T")[0]}
  {@const maxDate = orgUnit.parent?.validity.to?.split("T")[0]}

  <title>Rediger {orgUnit.name} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger {orgUnit.name}</h3>
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
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title="Slutdato"
            startValue={orgUnit.validity.to ? orgUnit.validity.to.split("T")[0] : null}
            id="to"
            min={$fromDate.value}
            max={maxDate ? maxDate : null}
          />
        </div>
        <Search
          title="Overenhed"
          type="org-unit"
          startValue={orgUnit.parent
            ? {
                uuid: orgUnit.parent.uuid,
                name: orgUnit.parent.name,
              }
            : undefined}
        />
        <Input
          title="Navn"
          id="name"
          bind:value={$name.value}
          errors={$name.errors}
          startValue={orgUnit.name}
          required={true}
        />

        <div class="flex flex-row gap-6">
          <SelectNew
            title="Enhedsniveau"
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
          <SelectNew
            title="Enhedstype"
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
        >Rediger enhed</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${orgUnit.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
