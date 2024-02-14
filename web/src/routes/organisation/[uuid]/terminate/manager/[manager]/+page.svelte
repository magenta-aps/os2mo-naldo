<script lang="ts">
  import { _ } from "svelte-i18n"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { ManagerDocument, TerminateManagerDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"

  const toDate = field("to", "", [required()])
  const svelteForm = form(toDate)

  gql`
    query Manager($uuid: [UUID!], $fromDate: DateTime!) {
      managers(filter: { uuids: $uuid, from_date: $fromDate }) {
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

    mutation TerminateManager($input: ManagerTerminateInput!) {
      manager_terminate(input: $input) {
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
            const mutation = await graphQLClient().request(TerminateManagerDocument, {
              input: result.data,
            })

            $success = {
              message: `Lederrollen ${
                mutation.manager_terminate.objects[0].employee
                  ? `for ${mutation.manager_terminate.objects[0].employee[0].name}`
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

<title>{$_("terminate")} {$_("manager")} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{$_("terminate")} {$_("manager")}</h3>
</div>

{#await graphQLClient().request( ManagerDocument, { uuid: $page.params.manager, fromDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const manager = data.managers.objects[0].objects[0]}
  {@const minDate = manager.validity.from.split("T")[0]}
  {@const maxDate = manager.org_unit[0].validity.to?.split("T")[0]}

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          startValue={$date}
          bind:value={$toDate.value}
          errors={$toDate.errors}
          title={$_("date.end_date")}
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
        >Afslut leder</button
      >
      <a
        href={`${base}/organisation/${$page.params.uuid}`}
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        >{$_("cancel")}</a
      >
    </div>
    <Error />
  </form>
{/await}
