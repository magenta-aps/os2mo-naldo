<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import type { SubmitFunction } from "./$types"
  import { CreateClassDocument } from "./query.generated"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { onMount } from "svelte"
  import { getFacets } from "$lib/http/getFacets"
  import { getFacetValidities } from "$lib/http/getValidities"
  import { facetStore } from "$lib/stores/facetStore"

  gql`
    mutation CreateClass($input: ClassCreateInput!, $date: DateTime!) {
      class_create(input: $input) {
        current(at: $date) {
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
            const mutation = await graphQLClient().request(CreateClassDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_create_class", {
                  values: {
                    name: mutation.class_create.current?.name,
                  },
                })
              ),
              type: "admin",
            }
            // Set facet, so when we redirect to `/admin`, the facet is selected
            facetStore.set(chosenFacet)
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  const fromDate = field("from", "", [required()])
  const facetField = field("facet", "", [required()])
  const name = field("name", "", [required()])
  const userKey = field("user_key", "", [required()])
  const svelteForm = form(fromDate, name, userKey)

  let startDate: string = $date
  let toDate: string
  let chosenFacet: { name: string; uuid: string; user_key?: string }
  let facets: { name: string; uuid: string; user_key?: string }[]

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  onMount(async () => {
    facets = await getFacets({
      uuid: $page.params.facet ?? null,
      fromDate: startDate,
    })
    if ($page.params.facet) {
      chosenFacet = facets[0] ?? null
    }
  })

  let facetController: AbortController
  $: if (!$page.params.facet && startDate) {
    if (facetController) facetController.abort()
    facetController = new AbortController()
    ;(async () => {
      try {
        facets = await getFacets(
          { uuid: null, fromDate: startDate },
          facetController?.signal
        )
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err) // Handle other errors
        }
      }
    })()
  }

  let validitiesController: AbortController
  $: if (chosenFacet) {
    if (validitiesController) validitiesController.abort()
    validitiesController = new AbortController()
    ;(async () => {
      try {
        validities = await getFacetValidities(
          chosenFacet?.uuid,
          validitiesController?.signal
        )
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err) // Handle other errors
        }
      }
    })()
  } else {
    validities = { from: null, to: null }
  }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("class", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("class", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded-sm">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <DateInput
          bind:value={startDate}
          bind:validationValue={$fromDate.value}
          errors={$fromDate.errors}
          title={capital($_("date.start_date"))}
          id="from"
          min={validities.from}
          max={toDate ? toDate : validities.to}
          required={true}
        />
        <DateInput
          bind:value={toDate}
          title={capital($_("date.end_date"))}
          id="to"
          min={$fromDate.value ? $fromDate.value : validities.from}
          max={validities.to}
        />
      </div>

      {#if facets && facets.length}
        <Select
          title={capital($_("facet", { values: { n: 1 } }))}
          id="facet"
          bind:value={chosenFacet}
          bind:name={$facetField.value}
          errors={$facetField.errors}
          iterable={facets}
          disabled={$page.params.facet ? true : false}
          required={true}
        />
      {/if}
      <div class="flex flex-row gap-6">
        <Input
          title={capital($_("name"))}
          id="name"
          bind:value={$name.value}
          errors={$name.errors}
          extra_classes="basis-1/2"
          required={true}
        />
        <Input
          title={capital($_("user_key"))}
          info={$_("user_key_tooltip")}
          id="user-key"
          bind:value={$userKey.value}
          errors={$userKey.errors}
          extra_classes="basis-1/2"
          required={true}
        />
      </div>
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("class", { values: { n: 1 } }) },
        })
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      href="{base}/admin"
    />
  </div>
  <Error />
</form>
