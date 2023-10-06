<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { ItUserAndOrgDocument, TerminateItUserDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"

  let toDate: string

  gql`
    query ITUserAndOrg($uuid: [UUID!], $fromDate: DateTime!, $org_unit_uuid: [UUID!]) {
      itusers(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            user_key
            uuid
            employee {
              name
            }
            validity {
              from
              to
            }
          }
        }
      }
      org_units(filter: { uuids: $org_unit_uuid, from_date: $fromDate }) {
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

    mutation TerminateITUser($input: ITUserTerminateInput!) {
      ituser_terminate(input: $input) {
        uuid
        objects {
          user_key
        }
      }
    }
  `
  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(TerminateItUserDocument, {
            input: result.data,
          })

          $success = {
            message: `IT-kontoen ${
              mutation.ituser_terminate.objects[0].user_key
                ? `for ${mutation.ituser_terminate.objects[0].user_key}`
                : ""
            } afsluttes d. ${toDate}`,
            uuid: $page.params.uuid,
            type: "organisation",
          }
        } catch (err) {
          $error = { message: err }
        }
      }
    }
</script>

{#await graphQLClient().request( ItUserAndOrgDocument, { uuid: $page.params.ituser, fromDate: $date, org_unit_uuid: $page.params.uuid } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const ituser = data.itusers.objects[0].objects[0]}
  {@const minDate = data.org_units.objects[0].objects[0].validity.from.split("T")[0]}
  {@const maxDate = data.org_units.objects[0].objects[0].validity.to?.split("T")[0]}

  <title>Afslut IT-konto: {ituser.user_key} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Afslut IT-konto: {ituser.user_key}</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          bind:value={toDate}
          startValue={$date}
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
        >Afslut IT-konto</button
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
