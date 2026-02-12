<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { OrgUnitDocument, TerminateOrgUnitDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getMinMaxValidities } from "$lib/utils/validities"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  const toDate = field("to", "", [required()])
  const svelteForm = form(toDate)

  gql`
    query OrgUnit($uuid: [UUID!]) {
      org_units(filter: { uuids: $uuid, from_date: null, to_date: null }) {
        objects {
          validities {
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation TerminateOrgUnit(
      $input: OrganisationUnitTerminateInput!
      $date: DateTime!
    ) {
      org_unit_terminate(input: $input) {
        current(at: $date) {
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
              date: result.data.to,
            })

            $success = {
              message: capital(
                $_("success_terminate", {
                  values: {
                    name: mutation.org_unit_terminate.current?.name,
                  },
                })
              ),
              uuid: mutation.org_unit_terminate.current?.uuid,
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
{#await graphQLClient().request(OrgUnitDocument, { uuid: $page.params.uuid })}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const validities = getMinMaxValidities(data.org_units.objects[0].validities)}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <!-- Ideally we would use validities from 'parent' if it's present, but since parent can't be a list of validities, we can't get min/max -->
        <DateInput
          startValue={$date}
          bind:value={$toDate.value}
          title={capital($_("date.end_date"))}
          id="to"
          min={validities.from}
          max={undefined}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("terminate_item", {
            values: { item: $_("unit", { values: { n: 1 } }) },
          })
        )}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        on:click={() => history.back()}
      />
    </div>
    <Error />
  </form>
{/await}
