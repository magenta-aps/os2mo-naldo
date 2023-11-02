<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { RoleDocument, TerminateRoleDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  const toDate = field("to", "", [required()])
  const svelteForm = form(toDate)

  gql`
    query Role($uuid: [UUID!], $fromDate: DateTime!) {
      roles(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            employee {
              uuid
              name
            }
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

    mutation TerminateRole($input: RoleTerminateInput!) {
      role_terminate(input: $input) {
        objects {
          uuid
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
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(TerminateRoleDocument, {
              input: result.data,
            })

            $success = {
              message: `Rollen ${
                mutation.role_terminate.objects[0].employee
                  ? `for ${mutation.role_terminate.objects[0].employee[0].name}`
                  : ""
              } afsluttes d. ${$toDate.value}`,
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

{#await graphQLClient().request( RoleDocument, { uuid: $page.params.role, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const role = data.roles.objects[0].objects[0]}
  {@const minDate = role.org_unit[0].validity.from.split("T")[0]}
  {@const maxDate = role.org_unit[0].validity.to?.split("T")[0]}

  <title
    >Afslut rolle {role.employee ? `for ${role.employee[0].name}` : ""} | OS2mo</title
  >

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">
      Afslut rolle {role.employee ? `for ${role.employee[0].name}` : ""}
    </h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

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
        >Afslut rolle</button
      >
      <a
        href={`${base}/employee/${$page.params.uuid}`}
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        >Annullér</a
      >
    </div>
    <Error />
  </form>
{/await}
