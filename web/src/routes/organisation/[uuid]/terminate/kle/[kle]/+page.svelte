<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { KleDocument, TerminateKleDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"

  let toDate: string

  gql`
    query KLE($uuid: [UUID!], $fromDate: DateTime!) {
      kles(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            validity {
              from
              to
            }
            org_unit {
              validity {
                from
                to
              }
            }
          }
        }
      }
    }

    mutation TerminateKLE($input: KLETerminateInput!) {
      kle_terminate(input: $input) {
        uuid
        objects {
          validity {
            to
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
          const mutation = await graphQLClient().request(TerminateKleDocument, {
            input: result.data,
          })

          $success = {
            message: `KLE-opmærkningen afsluttes ${
              mutation.kle_terminate.objects[0].validity.to.split("T")[0]
            }`,
            uuid: $page.params.uuid,
            type: "organisation",
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( KleDocument, { uuid: $page.params.kle, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const kle = data.kles.objects[0].objects[0]}
  {@const minDate = kle.org_unit[0].validity.from.split("T")[0]}
  {@const maxDate = kle.org_unit[0].validity.to?.split("T")[0]}

  <title>Afslut KLE-opmærkning | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">KLE-opmærkning</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          bind:value={toDate}
          startValue={$date}
          title="Slutdato"
          id="to"
          min={minDate}
          max={maxDate ? maxDate : null}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Afslut KLE-opmærkning</button
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
