<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { CreateKleDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import type { FacetValidities } from "$lib/utils/classes"
  import SelectMultiple from "$lib/components/forms/shared/SelectMultiple.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { formatKleNumberTitleAndUuid } from "$lib/utils/helpers"
  import { getClasses } from "$lib/http/getClasses"
  import { getValidities } from "$lib/http/getValidities"

  gql`
    mutation CreateKLE($input: KLECreateInput!, $date: DateTime!) {
      kle_create(input: $input) {
        current(at: $date) {
          org_unit(filter: { from_date: null, to_date: null }) {
            name
          }
        }
      }
    }
  `

  let startDate: string = $date
  let toDate: string

  const fromDate = field("from", "", [required()])
  const kleNumber = field("kle_number", "", [required()])
  const kleAspects = field("kle_aspects", undefined, [required()])
  const svelteForm = form(fromDate, kleNumber, kleAspects)

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(CreateKleDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("kle", { values: { n: 0 } }),
                    name: mutation.kle_create.current?.org_unit?.[0]?.name,
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

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  let facets: FacetValidities[]
  let abortController: AbortController
  $: if (startDate) {
    // Abort the previous request if a new one is about to start
    if (abortController) abortController.abort()
    abortController = new AbortController()

    const params = {
      currentDate: startDate,
      orgUuid: $page.params.uuid,
      facetUserKeys: ["kle_aspect", "kle_number"],
    }

    ;(async () => {
      validities = $page.params.uuid
        ? await getValidities($page.params.uuid)
        : { from: null, to: null }
      try {
        facets = await getClasses(params, abortController.signal)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err)
        }
      }
    })()
  }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("kle", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("kle", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
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
      {#if facets}
        <Select
          title={capital($_("kle_number"))}
          id="kle-number"
          bind:name={$kleNumber.value}
          errors={$kleNumber.errors}
          iterable={formatKleNumberTitleAndUuid(
            filterClassesByFacetUserKey(facets, "kle_number") ?? []
          )}
          required={true}
        />
        <SelectMultiple
          bind:name={$kleAspects.value}
          errors={$kleAspects.errors}
          on:clear={() => ($kleAspects.value = undefined)}
          title={capital($_("kle_aspect"))}
          id="kle-aspects"
          iterable={filterClassesByFacetUserKey(facets, "kle_aspect")}
          required={true}
        />
      {/if}
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("kle", { values: { n: 1 } }) },
        })
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      href="{base}/organisation/{$page.params.uuid}"
    />
  </div>
  <Error />
</form>
