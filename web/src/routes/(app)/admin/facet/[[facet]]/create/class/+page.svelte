<script lang="ts">
  import type { ValidityBounds } from "$lib/utils/validities"
  import { Temporal } from "temporal-polyfill"
  import { moValidityFrom } from "$lib/utils/date"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import EndDateInput from "$lib/components/forms/shared/EndDateInput.svelte"
  import StartDateInput from "$lib/components/forms/shared/StartDateInput.svelte"
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
  import Search from "$lib/components/search/Search.svelte"
  import type { SubmitFunction } from "./$types"
  import { GetItSystemsDocument, CreateClassDocument } from "./query.generated"
  import { env } from "$lib/env"
  import { createQuery } from "$lib/http/query"
  import { getConfederations, type Confederation } from "$lib/http/getClasses"
  import { formatITSystemNames, type ITSystem } from "$lib/utils/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { getFacets } from "$lib/http/getFacets"
  import { getFacetValidities } from "$lib/http/getValidities"
  import { facetStore } from "$lib/stores/facetStore"
  import { AddressScope, isAddressTypeFacet } from "$lib/constants/addresses"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

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
              date: result.data.validity.from as string,
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

  const fromDate = field<Temporal.ZonedDateTime | null | undefined>("from", undefined, [
    required(),
  ])
  const facetField = field("facet", "", [required()])
  const name = field("name", "", [required()])
  const userKey = field("user_key", "", [required()])
  // Only a trade union has a parent; the Select is hidden for every other facet.
  const parentField = field("parent", "", [
    (val) => ({ valid: !isTradeUnion || !!val, name: "required" }),
  ])
  const svelteForm = form(fromDate, name, userKey, parentField)

  let startDate: Temporal.ZonedDateTime | null | undefined = moValidityFrom($date)
  let toDate: Temporal.ZonedDateTime | null | undefined
  let chosenFacet: { name: string; uuid: string; user_key: string }

  let chosenItSystem: { name: string; uuid: string; user_key?: string } | undefined =
    undefined
  let selectedOwner: { uuid: string; name: string } | undefined = undefined
  let chosenParent: { uuid: string; name: string } | undefined = undefined

  // With a facet in the route this resolves just that one, which preselects
  // the disabled facet select.
  const facets = createQuery<{ name: string; uuid: string; user_key: string }[]>()
  $: if (startDate) {
    const at = startDate
    const facetUuid = $page.params.facet ?? null
    facets.run((signal) => getFacets({ uuid: facetUuid, fromDate: at }, signal))
  }

  const validities = createQuery<ValidityBounds>({ from: null, to: null })
  $: if (chosenFacet) {
    const facetUuid = chosenFacet.uuid
    validities.run((signal) => getFacetValidities(facetUuid, signal))
  } else {
    validities.run(async () => ({ from: null, to: null }))
  }

  // Refetched on every start date change: the IT system must be valid on it.
  const itSystems = createQuery<ITSystem[]>()
  $: if (chosenFacet?.user_key === "role" && startDate) {
    const at = startDate
    itSystems.run(async (signal) => {
      const res = await graphQLClient(signal).request(GetItSystemsDocument, {
        fromDate: at,
      })
      return res.itsystems.objects
    })
  }

  $: isTradeUnion =
    env.PUBLIC_ENABLE_CONFEDERATIONS && chosenFacet?.user_key === "trade_union"

  // Refetched on every start date change: the parent must be valid on it.
  const confederations = createQuery<Confederation[]>()
  $: if (isTradeUnion && startDate) {
    const at = startDate
    confederations.run((signal) => getConfederations(at, signal))
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
        <StartDateInput
          bind:value={startDate}
          bind:validationValue={$fromDate.value}
          errors={$fromDate.errors}
          title={capital($_("date.start_date"))}
          id="from"
          min={$validities.data?.from}
          max={toDate ? toDate : $validities.data?.to}
          required={true}
        />
        <EndDateInput
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
          startValue={$page.params.facet ? $facets.data[0] : undefined}
          errors={$facetField.errors}
          iterable={$facets.data}
          disabled={!!$page.params.facet || $facets.error}
          required={true}
        />
      {/if}
      {#if chosenFacet?.user_key === "role"}
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
      {/if}
      {#if isAddressTypeFacet(chosenFacet?.user_key)}
        <Select
          title={capital($_("scope"))}
          id="scope"
          iterable={AddressScope.map((scope) => ({ uuid: scope, name: scope }))}
          required={true}
        />
      {/if}
      {#if isTradeUnion}
        <Select
          title={capital($_("facets.name.confederation"))}
          id="parent"
          bind:value={chosenParent}
          bind:name={$parentField.value}
          errors={$parentField.errors}
          iterable={$confederations.data}
          disabled={$confederations.error && !$confederations.data}
          required={true}
        />
        {#if $confederations.error}
          <p class="text-sm text-error">
            {capital($_($confederations.data ? "load_error_options" : "load_error"))}
          </p>
        {/if}
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
      <Search
        type="org-unit"
        at={startDate}
        title={capital($_("class_owner", { values: { n: 1 } }))}
        bind:value={selectedOwner}
      />
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
