<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import type { SubmitFunction } from "./$types"
  import { CreateClassDocument, FacetDocument } from "./query.generated"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { getMinMaxValidities } from "$lib/util/helpers"
  import { facetStore } from "$lib/stores/facetStore"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  let toDate: string
  let facet: { name: string; uuid: string; user_key?: string }

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  const userKey = field("user_key", "", [required()])
  const facetField = field("facet", "", [required()])
  const svelteForm = form(fromDate, name, userKey, facetField)

  gql`
    query Facet($fromDate: DateTime!) {
      facets(filter: { from_date: $fromDate }) {
        objects {
          validities {
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
            facetStore.set(facet)
          } catch (err) {
            $error = { message: err }
          }
        }
      }
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

{#await graphQLClient().request(FacetDocument, { fromDate: $date })}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const facets = data.facets.objects}
  {@const validities = getMinMaxValidities(null)}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
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
        <Select
          title={capital($_("facet", { values: { n: 1 } }))}
          id="facet"
          bind:name={$facetField.value}
          bind:value={facet}
          errors={$facetField.errors}
          iterable={facets
            .map((e) => ({
              name: capital($_("facets.name." + e.validities[0].user_key)),
              user_key: e.validities[0].user_key,
              uuid: e.validities[0].uuid,
            }))
            .sort((a, b) => (a.name > b.name ? 1 : -1))}
          required={true}
        />
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
            id="user-key"
            extra_classes="basis-1/2"
            bind:value={$userKey.value}
            errors={$userKey.errors}
            required={true}
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("create_item", {
            values: { item: $_("class", { values: { n: 1 } }) },
          })
        )}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/admin`)}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  </form>
{/await}
