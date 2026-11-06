<script lang="ts">
  import type { ValidityBounds } from "$lib/utils/validities"
  import { Temporal } from "temporal-polyfill"
  import { lastValidDay, moValidityTo } from "$lib/utils/date"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import EndDateInput from "$lib/components/forms/shared/EndDateInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { TerminateClassDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { getFacets } from "$lib/http/getFacets"
  import { facetStore } from "$lib/stores/facetStore"
  import { createQuery } from "$lib/http/query"
  import { getClassValidities, getFacetValidities } from "$lib/http/getValidities"

  gql`
    mutation TerminateClass($input: ClassTerminateInput!, $date: DateTime!) {
      class_terminate(input: $input) {
        current(at: $date) {
          name
        }
      }
    }
  `

  const toDate = field<Temporal.ZonedDateTime | null | undefined>("to", undefined, [
    required(),
  ])
  const svelteForm = form(toDate)

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(TerminateClassDocument, {
              input: result.data,
              date: lastValidDay($toDate.value)!,
            })

            $success = {
              message: capital(
                $_("success_terminate_item", {
                  values: {
                    item: $_("class", { values: { n: 0 } }),
                    name: mutation.class_terminate.current?.name,
                  },
                })
              ),
              type: "class",
            }
            // Reopens the admin page on this class's facet.
            if ($facets.data?.[0]) facetStore.set($facets.data[0])
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  // A class cannot end before it starts, nor outlive its facet.
  const classValidities = createQuery<ValidityBounds>({ from: null, to: null })
  $: if ($page.params.class) {
    const uuid = $page.params.class
    classValidities.run((signal) => getClassValidities(uuid, signal))
  }

  const facetValidities = createQuery<ValidityBounds>({ from: null, to: null })
  const facets = createQuery<{ name: string; uuid: string; user_key: string }[]>()
  $: if ($page.params.facet) {
    const uuid = $page.params.facet
    const at = $date
    facetValidities.run((signal) => getFacetValidities(uuid, signal))
    facets.run((signal) => getFacets({ uuid, fromDate: at }, signal))
  }
</script>

<title
  >{capital(
    $_("terminate_item", {
      values: { item: $_("class", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("terminate_item", {
        values: { item: $_("class", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <div class="p-8">
      <EndDateInput
        startValue={moValidityTo($date)}
        bind:value={$toDate.value}
        errors={$toDate.errors}
        title={capital($_("date.end_date"))}
        id="to"
        min={$classValidities.data?.from}
        max={$facetValidities.data?.to}
        required={true}
      />
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("terminate_item", {
          values: { item: $_("class", { values: { n: 1 } }) },
        })
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      href="{base}/admin/facet"
    />
  </div>
  <Error />
</form>
