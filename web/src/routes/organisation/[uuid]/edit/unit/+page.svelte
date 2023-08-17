<script lang="ts">
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
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

  let startDate = new Date().toISOString().split("T")[0]
  let endDate: string
  let name: string
  let orgLevel: string
  let orgType: string
  let parent: { name: string; uuid?: any | null }

  gql`
    query GetOrgUnitAndFacets($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: ["org_unit_level", "org_unit_type"]) {
        uuid
        user_key
        classes {
          name
          uuid
          user_key
        }
      }
      org_units(uuids: $uuid, from_date: $fromDate) {
        objects {
          uuid
          name
          parent {
            uuid
            name
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
  {@const org_unit = data.org_units[0].objects[0]}
  {@const facets = data.facets}

  <title>Rediger {org_unit?.name} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger {org_unit.name}</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={startDate}
            startValue={$date}
            title="Startdato"
            id="start-date"
            max={endDate
              ? endDate
              : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
          />
          <DateInput
            bind:value={endDate}
            title="Slutdato"
            startValue={org_unit.validity.to
              ? org_unit.validity.to.split("T")[0]
              : null}
            id="end-date"
            min={startDate}
            max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
          />
        </div>
        <SelectOrgTree
          bind:selectedOrg={parent}
          startOrg={org_unit.parent}
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
