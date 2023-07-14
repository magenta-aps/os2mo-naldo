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
  import {
    KleAndFacetDocument,
    UpdateKleDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"

  let fromDate: string
  let toDate: string
  let kleNumber: string
  let kleAspect: string

  gql`
    query KLEAndFacet($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: ["kle_aspect", "kle_number"]) {
        uuid
        user_key
        classes {
          name
          uuid
        }
      }
      kles(uuids: $uuid, from_date: $fromDate) {
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

    mutation UpdateKLE($input: KLEUpdateInput!) {
      kle_update(input: $input) {
        uuid
      }
    }
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(UpdateKleDocument, {
            input: result.data,
          })
          $success = {
            message: `KLE-opmærkning er blevet redigeret.`,
            uuid: $page.params.uuid,
            type: "organisation",
          }
          setTimeout(() => goto(`${base}/organisation/${$page.params.uuid}/`), 200)
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( KleAndFacetDocument, { uuid: $page.params.kle, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const kle = data.kles[0].objects[0]}
  {@const facets = data.facets}
  {@const minDate = kle.org_unit[0].validity.from.split("T")[0]}
  {@const maxDate = kle.org_unit[0].validity.to?.split("T")[0]}

  <title>Rediger KLE-opmærkning | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger KLE-opmærkning</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={fromDate}
            startValue={$date}
            title="Startdato"
            id="from"
            min={minDate}
            max={maxDate ? maxDate : null}
          />
          <DateInput
            bind:value={toDate}
            startValue={kle.validity.to
              ? kle.validity.to.split("T")[0]
              : null}
            title="Slutdato"
            id="to"
            min={fromDate}
            max={maxDate ? maxDate : null}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title="KLE nummer"
            id="kle-number"
            startValue={kle.kle_number.name}
            bind:value={kleNumber}
            extra_classes="basis-1/2"
            iterable={facets[1].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
            required={true}
          />
          <Select
            title="KLE aspekt"
            id="kle-aspect"
            startValue={kle.kle_aspects[0].name}
            bind:value={kleAspect}
            extra_classes="basis-1/2"
            iterable={facets[0].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
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
