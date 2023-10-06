<script lang="ts">
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

  let fromDate: string
  let toDate: string
  let parent: {
    uuid: string
    name: string
    attrs: []
  }

  const urlHashOrgUnitUuid = getUuidFromHash($page.url.hash)
  const includeOrgUnit = urlHashOrgUnitUuid ? true : false

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(CreateOrgUnitDocument, {
            input: result.data,
          })
          $success = {
            message: `Organisationsenheden ${
              mutation.org_unit_create.objects[0]?.name
                ? mutation.org_unit_create.objects[0].name
                : ""
            } er blevet oprettet.`,
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
</script>

<title>Opret enhed | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Opret enhed</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  {#await graphQLClient().request( GetOrgUnitAndFacetsDocument, { uuid: urlHashOrgUnitUuid, fromDate: $date, includeOrgUnit: includeOrgUnit } )}
    <!-- TODO: Should have a skeleton for the loading stage -->
    Henter data...
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
            bind:value={fromDate}
            startValue={$date}
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title="Slutdato"
            id="to"
            min={fromDate ? fromDate : minDate}
            max={maxDate}
          />
        </div>
        {#if orgUnit}
          <Search
            type="org-unit"
            title="Angiv overenhed"
            id="parent-uuid"
            bind:value={parent}
            startValue={{
              uuid: orgUnit.uuid,
              name: orgUnit.name,
              attrs: [],
            }}
          />
        {:else}
          <Search
            type="org-unit"
            title="Angiv overenhed"
            id="parent-uuid"
            bind:value={parent}
          />
        {/if}

        <Input title="Navn" id="name" required={true} />
        <Select
          title="Enhedstype"
          id="org-unit-type"
          iterable={getClassesByFacetUserKey(facets, "org_unit_type")}
          required={true}
        />

        <div class="flex flex-row gap-6">
          <Select
            title="Enhedsniveau"
            id="org-unit-level"
            extra_classes="basis-1/2"
            iterable={getClassesByFacetUserKey(facets, "org_unit_level")}
          />
          <Input title="Enhedsnummer" id="org-unit-number" extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Opret enhed</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => history.back()}
      >
        Annullér
      </button>
    </div>
    <Error />
  {/await}
</form>
