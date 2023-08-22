<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import {
    FacetsAndRoleDocument,
    UpdateRoleDocument,
  } from "./query.generated"

  let fromDate: string
  let toDate: string
  let orgUnitUuid: string
  let roleType: string

  gql`
    query FacetsAndRole($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: "role_type") {
        uuid
        user_key
        classes {
          uuid
          user_key
          name
        }
      }
      roles(uuids: $uuid, from_date: $fromDate) {
        objects {
          employee {
            name
            validity {
              from
              to
            }
          }
          org_unit {
            name
            uuid
          }
          role_type {
            name
            uuid
          }
          validity {
            from
            to
          }
        }
      }
    }

    mutation UpdateRole($input: RoleUpdateInput!) {
      role_update(input: $input) {
        objects {
          employee {
            name
          }
        }
      }
    }
  `
  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(UpdateRoleDocument, {
            input: result.data,
          })
          $success = {
            message: `Rolle til ${mutation.role_update.objects[0].employee[0].name} er blevet redigeret`,
            uuid: $page.params.uuid,
            type: "employee",
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( FacetsAndRoleDocument, { uuid: $page.params.role, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const facets = data.facets}
  {@const role = data.roles[0].objects[0]}
  {@const org_unit = data.roles[0].objects[0].org_unit[0]}
  {@const minDate = data.roles[0].objects[0].employee[0].validity?.from?.split("T")[0]}
  {@const maxDate = data.roles[0].objects[0].employee[0].validity?.to?.split("T")[0]}

  <title>Rediger rolle | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger rolle</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={fromDate}
            startValue={$date}
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
          />
          <DateInput
            bind:value={toDate}
            startValue={role.validity?.to?.split("T")[0]}
            title="Slutdato"
            id="to"
            min={fromDate ? fromDate : minDate}
            max={maxDate}
          />
        </div>
        <div class="flex flex-row gap-6">
          <!-- TODO: We need some sort of input, to choose an org_unit.
            Hopefully we can do it with GraphQL soon :copium: -->
          <Input
            title="Organisationsenhed UUID"
            id="org-unit-uuid"
            bind:value={orgUnitUuid}
            startValue={org_unit.uuid}
            required={true}
            extra_classes="basis-1/2"
          />

          <Select
            title="Rolletype"
            id="role-type"
            bind:value={roleType}
            startValue={role.role_type.name}
            iterable={getClassesByFacetUserKey(facets, "role_type")}
            required={true}
            extra_classes="basis-1/2"
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger rolle</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
