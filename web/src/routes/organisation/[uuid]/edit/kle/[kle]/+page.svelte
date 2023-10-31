<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { KleAndFacetDocument, UpdateKleDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  let toDate: string
  const fromDate = field("from", "", [required()])
  $: svelteForm = form(fromDate)

  gql`
    query KLEAndFacet($uuid: [UUID!], $fromDate: DateTime) {
      facets(filter: { user_keys: ["kle_aspect", "kle_number"] }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              name
              uuid
              user_key
            }
          }
        }
      }
      kles(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            kle_aspects {
              name
            }
            kle_number {
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

    mutation UpdateKLE($input: KLEUpdateInput!) {
      kle_update(input: $input) {
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
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateKleDocument, {
              input: result.data,
            })
            $success = {
              message: `KLE-opmærkningen ${
                mutation.kle_update.objects[0].org_unit
                  ? `for ${mutation.kle_update.objects[0].org_unit[0].name}`
                  : ""
              } redigeres fra d. ${$fromDate.value}`,
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

{#await graphQLClient().request( KleAndFacetDocument, { uuid: $page.params.kle, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const kle = data.kles.objects[0].objects[0]}
  {@const facets = data.facets.objects}
  {@const minDate = kle.org_unit[0].validity.from.split("T")[0]}
  {@const maxDate = kle.org_unit[0].validity.to?.split("T")[0]}

  <title>Rediger KLE-opmærkning | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger KLE-opmærkning</h3>
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
            startValue={kle.validity.to ? kle.validity.to.split("T")[0] : null}
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title="KLE nummer"
            id="kle-number"
            startValue={kle.kle_number.name}
            extra_classes="basis-1/2"
            iterable={getClassesByFacetUserKey(facets, "kle_number")}
            required={true}
          />
          <Select
            title="KLE aspekt"
            id="kle-aspect"
            startValue={kle.kle_aspects[0].name}
            extra_classes="basis-1/2"
            iterable={getClassesByFacetUserKey(facets, "kle_aspect")}
            required={true}
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger KLE-opmærkning</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
