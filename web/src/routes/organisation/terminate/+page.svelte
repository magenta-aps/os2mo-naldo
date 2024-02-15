<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitDocument, TerminateOrgUnitDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/search.svelte"
  import { getUuidFromHash } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"

  let selectedOrgUnit: {
    uuid: string
    name: string
  }

  const toDate = field("to", "", [required()])
  const orgUnitField = field("org_unit", "", [required()])

  const svelteForm = form(toDate, orgUnitField)

  const urlHashOrgUnitUuid = getUuidFromHash($page.url.hash)

  gql`
    query OrgUnit($uuid: [UUID!], $fromDate: DateTime!, $includeOrgUnit: Boolean!) {
      ...getOrgUnitData
    }

    fragment getOrgUnitData on Query {
      org_units(filter: { uuids: $uuid, from_date: $fromDate })
        @include(if: $includeOrgUnit) {
        objects {
          objects {
            uuid
            name
            validity {
              from
              to
            }
            parent {
              validity {
                from
                to
              }
            }
          }
        }
      }
    }

    mutation TerminateOrgUnit($input: OrganisationUnitTerminateInput!) {
      org_unit_terminate(input: $input) {
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
            const mutation = await graphQLClient().request(TerminateOrgUnitDocument, {
              input: result.data,
            })

            $success = {
              message: `Organisationsenheden ${
                mutation.org_unit_terminate.objects[0]?.name
                  ? mutation.org_unit_terminate.objects[0].name
                  : ""
              } afsluttes d. ${$toDate.value}`,
              uuid: mutation.org_unit_terminate.objects[0]?.uuid
                ? mutation.org_unit_terminate.objects[0].uuid
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
    $_("terminate_item", {
      values: { item: $_("org_unit", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("terminate_item", {
        values: { item: $_("org_unit", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( OrgUnitDocument, { uuid: urlHashOrgUnitUuid, fromDate: $date, includeOrgUnit: urlHashOrgUnitUuid ? true : false } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const orgUnit = data.org_units?.objects[0].objects[0]}
  <!-- De her dates skal opdateres afhængig af hvilken org_unit man vælger, nu når det ikke skal loades ind -->
  {@const minDate = orgUnit?.validity.from.split("T")[0]}
  {@const maxDate = orgUnit?.parent?.validity.to?.split("T")[0]}
  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          startValue={$date}
          bind:value={$toDate.value}
          errors={$toDate.errors}
          title={capital($_("date.end_date"))}
          id="to"
          min={minDate}
          max={maxDate ? maxDate : null}
          required={true}
        />
        {#if orgUnit}
          <Search
            type="org-unit"
            title="{capital($_('specify'))} {$_('unit', { values: { n: 1 } })}"
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
        {:else}
          <Search
            type="org-unit"
            title="{capital($_('specify'))} {$_('parent')}"
            bind:name={$orgUnitField.value}
            on:clear={() => ($orgUnitField.value = "")}
            errors={$orgUnitField.errors}
            bind:value={selectedOrgUnit}
            required={true}
          />
        {/if}
        <Breadcrumbs orgUnit={selectedOrgUnit} />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("terminate_item", {
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
      <Error />
    </div>
  </form>
{/await}
