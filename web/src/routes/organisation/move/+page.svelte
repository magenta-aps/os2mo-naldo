<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { UpdateOrgUnitDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/search.svelte"
  import { page } from "$app/stores"
  import { OrgUnitDocument } from "./query.generated"
  import Input from "$lib/components/forms/shared/input.svelte"
  import { getUuidFromHash } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"

  let toDate: string
  let selectedOrgUnit: {
    uuid: string
    name: string
  }
  let parent: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const orgUnitField = field("org_unit", "", [required()])
  const svelteForm = form(fromDate, orgUnitField)

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
          parent {
            name
          }
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
            const mutation = await graphQLClient().request(UpdateOrgUnitDocument, {
              input: result.data,
            })

            $success = {
              message: `Organisationsenheden ${
                mutation.org_unit_update.objects[0].name
                  ? mutation.org_unit_update.objects[0].name
                  : ""
              } flyttes til ${
                mutation.org_unit_update.objects[0].parent
                  ? `${mutation.org_unit_update.objects[0].parent.name}`
                  : "roden"
              } d. ${$fromDate.value}`,
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

<title>Flyt organisationsenhed | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Flyt organisationsenhed</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <!-- These inputs needs to update, when org-unit is changed -->
        <DateInput
          startValue={$date}
          bind:value={$fromDate.value}
          errors={$fromDate.errors}
          title="Flyttedato"
          id="from"
          max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
          required={true}
        />
        <DateInput
          bind:value={toDate}
          title="Slutdato"
          id="to"
          min={$fromDate.value ? $fromDate.value : undefined}
          max={undefined}
        />
        <!-- FIXME: min/max -->
      </div>
      {#if urlHashOrgUnitUuid}
        {#await graphQLClient().request( OrgUnitDocument, { uuid: urlHashOrgUnitUuid, fromDate: $date } )}
          <Input
            title="Angiv enhed"
            id="organisation-uuid"
            disabled
            placeholder="Henter organisation..."
            required={true}
          />
        {:then data}
          {@const orgUnit = data.org_units.objects[0].objects[0]}
          <Search
            title="Angiv enhed"
            type="org-unit"
            startValue={{
              uuid: orgUnit.uuid,
              name: orgUnit.name,
            }}
            bind:name={$orgUnitField.value}
            on:clear={() => ($orgUnitField.value = "")}
            errors={$orgUnitField.errors}
            bind:value={selectedOrgUnit}
            required={true}
          />
        {/await}
      {:else}
        <Search
          type="org-unit"
          title="Angiv enhed"
          bind:name={$orgUnitField.value}
          on:clear={() => ($orgUnitField.value = "")}
          errors={$orgUnitField.errors}
          bind:value={selectedOrgUnit}
          required={true}
        />
      {/if}
      <Breadcrumbs orgUnit={selectedOrgUnit} />

      <Search
        type="org-unit"
        id="select-parent-org-tree"
        title="Angiv ny overenhed"
        bind:value={parent}
      />
      <Breadcrumbs
        orgUnit={parent}
        emptyMessage="{selectedOrgUnit
          ? selectedOrgUnit.name
          : 'Organisationsenheden'} flyttes til roden"
      />
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >Flyt enhed</button
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
