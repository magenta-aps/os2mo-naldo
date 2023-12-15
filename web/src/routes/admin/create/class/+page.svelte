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
  import Input from "$lib/components/forms/shared/input.svelte"
  import type { SubmitFunction } from "./$types"
  import { CreateClassDocument, FacetDocument } from "./query.generated"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { getFacetUserKeys } from "$lib/util/helpers"
  import { getSpecificFacet } from "$lib/util/get_classes"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  // const userKey = field("user_key", "", [required()])
  // const facetField = field("facet", "", [required()])
  const svelteForm = form(fromDate, name)

  gql`
    query Facet($fromDate: DateTime) {
      facets(filter: { from_date: $fromDate }) {
        objects {
          objects {
            uuid
            user_key
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation CreateClass($input: ClassCreateInput!) {
      class_create(input: $input) {
        objects {
          name
          uuid
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
            const mutation = await graphQLClient().request(CreateClassDocument, {
              input: result.data,
            })
            $success = {
              message: `Stillingsbetegnelsen ${
                mutation.class_create.objects[0]?.name
                  ? `${mutation.class_create.objects[0].name}`
                  : ""
              } er oprettet fra d. ${$fromDate.value}`,
              type: "admin",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

{#await graphQLClient().request(FacetDocument, { fromDate: $date })}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const facets = data.facets.objects}
  {@const jobFunction = getSpecificFacet(facets, "engagement_job_function")}
  {@const minDate = facets[0].objects[0].validity?.from?.split("T")[0]}
  {@const maxDate = facets[0].objects[0].validity?.to?.split("T")[0]}

  <title>Opret stillingsbetegnelse | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Opret stillingsbetegnelse</h3>
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
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>
        <!-- TODO: when we allow creating classes for different facets, add this back -->
        <input type="hidden" id="facet" name="facet" value={jobFunction.uuid} />
        <!-- <Select
          title="Facet"
          id="facet"
          bind:name={$facetField.value}
          errors={$facetField.errors}
          startValue={getSpecificFacet(facets, "engagement_job_function")}
          iterable={getFacetUserKeys(facets)}
          disabled
          required={true}
        /> -->
        <!-- <div class="flex flex-row gap-6"> -->
        <Input
          title="Navn"
          id="name"
          bind:value={$name.value}
          errors={$name.errors}
          required={true}
        />
        <!-- TODO: user_key removed for now - should probably be a possibility in the future -->
        <!-- <Input
            title="User key"
            id="user-key"
            extra_classes="basis-1/2"
            bind:value={$userKey.value}
            errors={$userKey.errors}
          /> -->
        <!-- </div> -->
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Opret stillingsbetegnelse</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/admin`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
