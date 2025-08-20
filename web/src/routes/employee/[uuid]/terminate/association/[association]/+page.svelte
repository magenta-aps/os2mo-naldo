<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { AssociationDocument, TerminateAssociationDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities } from "$lib/utils/validities"

  const toDate = field("to", "", [required()])
  const svelteForm = form(toDate)

  gql`
    query Association($uuid: [UUID!]) {
      associations(filter: { uuids: $uuid, from_date: null, to_date: null }) {
        objects {
          validities {
            validity {
              from
              to
            }
            person(filter: { from_date: null, to_date: null }) {
              validity {
                from
                to
              }
            }
          }
        }
      }
    }

    mutation TerminateAssociation(
      $input: AssociationTerminateInput!
      $date: DateTime!
    ) {
      association_terminate(input: $input) {
        current(at: $date) {
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
            const mutation = await graphQLClient().request(
              TerminateAssociationDocument,
              {
                input: result.data,
                date: result.data.to,
              }
            )
            $success = {
              message: capital(
                $_("success_terminate_item", {
                  values: {
                    item: $_("association", { values: { n: 0 } }),
                    name: mutation.association_terminate.current?.person?.[0].name,
                  },
                })
              ),
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

<title
  >{capital(
    $_("terminate_item", {
      values: { item: $_("association", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("terminate_item", {
        values: { item: $_("association", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( AssociationDocument, { uuid: $page.params.association } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const associationValidities = getMinMaxValidities(
    data.associations.objects[0].validities
  )}
  {@const validities = getMinMaxValidities(
    data.associations.objects[0].validities[0].person
  )}
  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          startValue={$date}
          bind:value={$toDate.value}
          errors={$toDate.errors}
          title={capital($_("date.end_date"))}
          id="to"
          min={associationValidities.from}
          max={validities.to}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("terminate_item", {
            values: { item: $_("association", { values: { n: 1 } }) },
          })
        )}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/employee/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
