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
  import { GetItSystemsDocument, CreateClassDocument } from "./query.generated"
  import { formatITSystemNames, type ITSystem } from "$lib/utils/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { createQuery } from "$lib/http/query"
  import { getFacets } from "$lib/http/getFacets"
  import { getFacetValidities } from "$lib/http/getValidities"
  import { facetStore } from "$lib/stores/facetStore"
  import { AddressScope, isAddressTypeFacet } from "$lib/constants/addresses"

  gql`
    query GetITSystems($fromDate: DateTime!) {
      itsystems {
        objects {
          current(at: $fromDate) {
            name
            uuid
            user_key
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
              type: "class",
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
  let chosenFacet: { name: string; uuid: string; user_key: string }

  let chosenItSystem: { name: string; uuid: string; user_key?: string } | undefined =
    undefined

  // The facet list is date-filtered, so it refetches with the start date. With a
  // facet in the route it resolves to that one facet, which then seeds the
  // (disabled) select below.
  const facets = createQuery<{ name: string; uuid: string; user_key: string }[]>()
  $: if (startDate) {
    const facetUuid = $page.params.facet ?? null
    facets.run((signal) => getFacets({ uuid: facetUuid, fromDate: startDate }, signal))
  }
  $: if ($page.params.facet && $facets.data?.length && !chosenFacet) {
    chosenFacet = $facets.data[0]
  }

  // Datepicker bounds for the chosen facet.
  const validities = createQuery<{
    from: string | undefined | null
    to: string | undefined | null
  }>({ from: null, to: null })
  $: if (chosenFacet) {
    const facetUuid = chosenFacet.uuid
    validities.run((signal) => getFacetValidities(facetUuid, signal))
  } else {
    validities.run(async () => ({ from: null, to: null }))
  }

  const itSystems = createQuery<ITSystem[]>()
  $: if (chosenFacet?.user_key === "role" && startDate) {
    itSystems.run((signal) =>
      graphQLClient(signal)
        .request(GetItSystemsDocument, { fromDate: startDate })
        // Map to the format the Select component expects
        .then((res) => res.itsystems.objects)
    )
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
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <DateInput
          bind:value={startDate}
          bind:validationValue={$fromDate.value}
          errors={$fromDate.errors}
          title={capital($_("date.start_date"))}
          id="from"
          min={$validities.data?.from}
          max={toDate ? toDate : $validities.data?.to}
          required={true}
        />
        <DateInput
          bind:value={toDate}
          title={capital($_("date.end_date"))}
          id="to"
          min={$fromDate.value ? $fromDate.value : $validities.data?.from}
          max={$validities.data?.to}
        />
      </div>

      {#if $facets.loading && !$facets.data}
        <Skeleton />
      {/if}
      {#if $facets.error}
        <p class="text-sm text-error">
          {capital($_($facets.data ? "load_error_options" : "load_error"))}
        </p>
      {/if}
      {#if $facets.data?.length}
        <Select
          title={capital($_("facet", { values: { n: 1 } }))}
          id="facet"
          bind:value={chosenFacet}
          bind:name={$facetField.value}
          errors={$facetField.errors}
          iterable={$facets.data}
          disabled={!!$page.params.facet || $facets.error}
          required={true}
        />
      {/if}
      {#if $itSystems.loading && !$itSystems.data}
        <Skeleton />
      {/if}
      {#if $itSystems.error}
        <p class="text-sm text-error">
          {capital($_($itSystems.data ? "load_error_options" : "load_error"))}
        </p>
      {/if}
      {#if $itSystems.data}
        <Select
          title={capital($_("itsystem", { values: { n: 1 } }))}
          id="itsystem"
          bind:value={chosenItSystem}
          iterable={formatITSystemNames($itSystems.data)}
          disabled={$itSystems.error}
          required={true}
        />
      {/if}
      {#if isAddressTypeFacet(chosenFacet?.user_key)}
        <Select
          title={capital($_("scope"))}
          id="scope"
          iterable={AddressScope.map((scope) => ({ uuid: scope, name: scope }))}
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
      href="{base}/admin/facet"
    />
  </div>
  <Error />
</form>
