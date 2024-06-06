<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
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
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities } from "$lib/util/helpers"

  const toDate = field("to", "", [required()])
  const svelteForm = form(toDate)

  gql`
    query Address($uuid: [UUID!]) {
      addresses(filter: { uuids: $uuid, from_date: null, to_date: null }) {
        objects {
          validities {
            validity {
              from
              to
            }
            org_unit(filter: { from_date: null, to_date: null }) {
              validity {
                from
                to
              }
            }
          }
        }
      }
    }

    mutation TerminateAddress($input: AddressTerminateInput!, $date: DateTime!) {
      address_terminate(input: $input) {
        current(at: $date) {
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
              date: result.data.to,
            })

            $success = {
              message: capital(
                $_("success_terminate_item", {
                  values: {
                    item: $_("address", { values: { n: 0 } }),
                    name: mutation.address_terminate.current?.org_unit?.[0].name,
                  },
                })
              ),
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

<title
  >{capital(
    $_("terminate_item", {
      values: { item: $_("address", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("terminate_item", {
        values: { item: $_("address", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( AddressDocument, { uuid: $page.params.address, fromDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const addressValidities = getMinMaxValidities(data.addresses.objects[0].validities)}
  {@const validities = getMinMaxValidities(
    data.addresses.objects[0].validities[0].org_unit
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
          min={addressValidities.from}
          max={validities.to}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("terminate_item", {
            values: { item: $_("address", { values: { n: 1 } }) },
          })
        )}</button
      >
      <a
        href={`${base}/organisation/${$page.params.uuid}`}
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        >{capital($_("cancel"))}</a
      >
    </div>
    <Error />
  </form>
{/await}
