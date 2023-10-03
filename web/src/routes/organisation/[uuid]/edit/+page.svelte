<script lang="ts">
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

  let fromDate: string
  let toDate: string
  let name: string
  let orgLevel: string
  let orgType: string

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
              name
            }
            org_unit_level {
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
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(UpdateOrgUnitDocument, {
            input: result.data,
          })

          $success = {
            message: `${name} er blevet redigeret`,
            uuid: mutation.org_unit_update.uuid,
            type: "organisation",
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( GetOrgUnitAndFacetsDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const org_unit = data.org_units.objects[0].objects[0]}
  {@const facets = data.facets.objects}
  {@const minDate = org_unit.parent?.validity.from.split("T")[0]}
  {@const maxDate = org_unit.parent?.validity.to?.split("T")[0]}

  <title>Rediger {org_unit.name} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger {org_unit.name}</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={fromDate}
            startValue={$date}
            title="Startdato"
            id="from"
            min={minDate}
            max={maxDate ? maxDate : null}
          />
          <DateInput
            bind:value={toDate}
            title="Slutdato"
            startValue={org_unit.validity.to
              ? org_unit.validity.to.split("T")[0]
              : null}
            id="to"
            min={fromDate}
            max={maxDate ? maxDate : null}
          />
        </div>
        <Search
          title="Overenhed"
          type="org-unit"
          startValue={org_unit.parent
            ? {
                uuid: org_unit.parent.uuid,
                name: org_unit.parent.name,
                attrs: [],
              }
            : undefined}
        />
        <Input
          title="Navn"
          id="name"
          bind:value={name}
          startValue={org_unit.name}
          required={true}
        />

        <div class="flex flex-row gap-6">
          <Select
            title="Enhedsniveau"
            id="org-level"
            startValue={org_unit.org_unit_level?.name}
            extra_classes="basis-1/2"
            bind:value={orgLevel}
            iterable={getClassesByFacetUserKey(facets, "org_unit_level")}
            required={true}
          />
          <Select
            title="Enhedstype"
            id="org-type"
            startValue={org_unit.unit_type?.name}
            extra_classes="basis-1/2"
            bind:value={orgType}
            iterable={getClassesByFacetUserKey(facets, "org_unit_type")}
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
        on:click={() => goto(`${base}/organisation/${org_unit.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
