<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
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
  import { OwnerDocument, UpdateOwnerDocument } from "./query.generated"
  import Search from "$lib/components/search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const svelteForm = form(fromDate)

  gql`
    query Owner($uuid: [UUID!], $fromDate: DateTime) {
      owners(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            owner {
              name
              uuid
            }
            person {
              validity {
                from
                to
              }
            }
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation UpdateOwner($input: OwnerUpdateInput!) {
      owner_update(input: $input) {
        objects {
          person {
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
            const mutation = await graphQLClient().request(UpdateOwnerDocument, {
              input: result.data,
            })
            $success = {
              message: `Ejeren ${
                mutation.owner_update.objects[0].person
                  ? `for ${mutation.owner_update.objects[0].person[0].name}`
                  : ""
              } redigeres fra d. ${$fromDate.value}`,
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

{#await graphQLClient().request( OwnerDocument, { uuid: $page.params.owner, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const ownerObj = data.owners.objects[0].objects[0]}
  {@const minDate =
    data.owners.objects[0].objects[0].person?.[0].validity?.from?.split("T")[0]}
  {@const maxDate =
    data.owners.objects[0].objects[0].person?.[0].validity?.to?.split("T")[0]}

  <title>Rediger ejer | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger ejer</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={ownerObj.validity?.to?.split("T")[0]}
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>
        <Search
          type="employee"
          startValue={ownerObj.owner
            ? {
                uuid: ownerObj.owner[0].uuid,
                name: ownerObj.owner[0].name,
              }
            : undefined}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger ejer</button
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
