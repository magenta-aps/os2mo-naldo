<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { AddressDocument, TerminateAddressDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"

  const toDate = field("to", "", [required()])
  const svelteForm = form(toDate)

  gql`
    query Address($uuid: [UUID!], $fromDate: DateTime!, $org_unit_uuid: [UUID!]) {
      addresses(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            value
            address_type {
              name
            }
            validity {
              from
              to
            }
          }
        }
      }
      org_units(filter: { uuids: $org_unit_uuid }) {
        objects {
          objects {
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation TerminateAddress($input: AddressTerminateInput!) {
      address_terminate(input: $input) {
        uuid
        objects {
          org_unit {
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
            const mutation = await graphQLClient().request(TerminateAddressDocument, {
              input: result.data,
            })

            $success = {
              message: `Adressen ${
                mutation.address_terminate.objects[0].org_unit
                  ? `for ${mutation.address_terminate.objects[0].org_unit[0].name}`
                  : ""
              } afsluttes d. ${$toDate.value}`,
              uuid: $page.params.uuid,
              type: "organisation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<title>Afslut adresse | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Afslut adresse</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( AddressDocument, { uuid: $page.params.address, fromDate: $date, org_unit_uuid: $page.params.uuid } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const address = data.addresses.objects[0].objects[0]}
  {@const minDate = address.validity.from.split("T")[0]}
  {@const maxDate = data.org_units.objects[0].objects[0].validity.to?.split("T")[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          startValue={$date}
          bind:value={$toDate.value}
          errors={$toDate.errors}
          title="Slutdato"
          id="to"
          min={minDate}
          max={maxDate ? maxDate : null}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Afslut adresse</button
      >
      <a
        href={`${base}/organisation/${$page.params.uuid}`}
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        >Annullér</a
      >
    </div>
    <Error />
  </form>
{/await}
