<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitDocument, UpdateOrgUnitDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/search.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import { page } from "$app/stores"
  import { getUuidFromHash } from "$lib/util/helpers"

  let fromDate: string
  let orgUnit: {
    uuid: string
    name: string
    attrs: []
  }
  let name: string
  const urlHashOrgUnitUuid = getUuidFromHash($page.url.hash)

  gql`
    query OrgUnit($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            name
            uuid
          }
        }
      }
    }
    mutation UpdateOrgUnit($input: OrganisationUnitUpdateInput!) {
      org_unit_update(input: $input) {
        uuid
        objects {
          name
        }
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
            message: `${orgUnit.name} er blevet omdøbt til ${mutation.org_unit_update.objects[0].name}`,
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

<title>Omdøb organisationsenhed | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Omdøb organisationsenhed</h3>
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
          max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
      </div>
      {#if urlHashOrgUnitUuid}
        {#await graphQLClient().request( OrgUnitDocument, { uuid: urlHashOrgUnitUuid, fromDate: $date } )}
          <Input
            title="Angiv enhed"
            id="organisation-uuid"
            disabled
            placeholder="Henter organisation..."
          />
        {:then data}
          {@const orgUnitUuidFromHash = data.org_units.objects[0].objects[0]}
          <Search
            title="Angiv enhed"
            type="org-unit"
            startValue={{
              uuid: orgUnitUuidFromHash.uuid,
              name: orgUnitUuidFromHash.name,
              attrs: [],
            }}
            bind:value={orgUnit}
            on:change={() => (name = orgUnit.name)}
          />
          <Input
            title="Nyt navn"
            id="name"
            startValue={orgUnitUuidFromHash.name}
            bind:value={name}
          />
        {/await}
      {:else}
        <Search
          type="org-unit"
          title="Angiv enhed"
          bind:value={orgUnit}
          on:change={() => (name = orgUnit.name)}
        />
        <Input title="Nyt navn" id="name" bind:value={name} />
      {/if}
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >Omdøb enhed</button
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
</form>
