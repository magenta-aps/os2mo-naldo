<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import type { SubmitFunction } from "./$types"
  import {
    GetItSystemsDocument,
    UpdateClassDocument,
    ClassDocument,
  } from "./query.generated"
  import { formatITSystemNames, type ITSystem } from "$lib/utils/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { getFacetValidities } from "$lib/http/getValidities"
  import { facetStore } from "$lib/stores/facetStore"
  import { AddressScope, isAddressTypeFacet } from "$lib/constants/addresses"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { createQuery } from "$lib/http/query"
  import { normalizeClass } from "$lib/utils/normalizeForm"

  gql`
    query Class($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      classes(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            name
            scope
            facet_response {
              uuid
              current(at: $fromDate) {
                user_key
              }
            }
            it_system_response {
              uuid
              current(at: $fromDate) {
                user_key
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
      }
    }

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

    mutation UpdateClass($input: ClassUpdateInput!, $date: DateTime!) {
      class_update(input: $input) {
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
            const mutation = await graphQLClient().request(UpdateClassDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit", {
                  values: {
                    name: mutation.class_update.current?.name,
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

  let startDate: string = $date
  let toDate: string
  let chosenFacet: { name: string; uuid: string; user_key: string }

  let chosenItSystem: { name: string; uuid: string; user_key?: string } | undefined =
    undefined
  let chosenScope: { name: string; uuid: string } | undefined = undefined

  let facetUuid: string | undefined = undefined
  let facetUserKey: string | undefined | null = null

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  const userKey = field("user_key", "", [required()])
  const svelteForm = form(fromDate, name, userKey)

  const validities = createQuery<{
    from: string | undefined | null
    to: string | undefined | null
  }>({ from: null, to: null })
  $: if (facetUuid) {
    const uuid = facetUuid
    validities.run((signal) => getFacetValidities(uuid, signal))
  } else {
    validities.run(async () => ({ from: null, to: null }))
  }

  const itSystems = createQuery<ITSystem[]>()
  $: if (facetUserKey === "role" && startDate) {
    itSystems.run(async (signal) => {
      const res = await graphQLClient(signal).request(GetItSystemsDocument, {
        fromDate: startDate,
      })
      return res.itsystems.objects
    })
  }

  const classPromise = graphQLClient().request(ClassDocument, {
    uuid: $page.params.class,
    fromDate: $page.url.searchParams.get("from"),
    toDate: $page.url.searchParams.get("to"),
  })

  let initialClass: any = null
  classPromise.then(
    (data) => {
      const cls = data.classes.objects[0].validities[0]
      initialClass = normalizeClass(cls)
      facetUuid = cls.facet_response.uuid
      facetUserKey = cls.facet_response.current?.user_key
    },
    () => {}
  )

  let hasChanges = false
  $: if (initialClass) {
    const editableChanged =
      $name.value !== initialClass.name ||
      $userKey.value !== initialClass.user_key ||
      (facetUserKey === "role" &&
        (chosenItSystem?.name ?? "") !== initialClass.itsystem) ||
      (isAddressTypeFacet(facetUserKey) &&
        (chosenScope?.uuid ?? "") !== initialClass.scope)

    const toDateExtended =
      toDate === "" ? initialClass.to !== null : toDate > (initialClass.to ?? null)
    hasChanges = editableChanged || toDateExtended
  }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("class", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("class", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await classPromise}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const cls = data.classes.objects[0].validities[0]}
  {@const facetResponse = data.classes.objects[0].validities[0].facet_response}

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
            startValue={cls.validity.to ? cls.validity.to.split("T")[0] : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : $validities.data?.from}
            max={$validities.data?.to}
          />
        </div>
        <Select
          title={capital($_("facet", { values: { n: 1 } }))}
          id="facet"
          bind:value={chosenFacet}
          startValue={{
            uuid: facetResponse.uuid,
            name: capital(
              $_("facets.name." + facetResponse.current?.user_key, {
                default: facetResponse.current?.user_key,
              })
            ),
            user_key: facetResponse.current?.user_key,
          }}
          required={true}
          extra_classes="basis-1/2"
          disabled
        />

        {#if facetUserKey === "role"}
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
              startValue={cls.it_system_response?.current
                ? {
                    uuid: cls.it_system_response.uuid,
                    name: cls.it_system_response.current.name,
                  }
                : undefined}
              iterable={formatITSystemNames($itSystems.data)}
              disabled={$itSystems.error}
              required={true}
            />
          {/if}
        {/if}
        {#if isAddressTypeFacet(facetUserKey)}
          <Select
            title={capital($_("scope"))}
            id="scope"
            bind:value={chosenScope}
            startValue={cls.scope ? { uuid: cls.scope, name: cls.scope } : undefined}
            iterable={AddressScope.map((scope) => ({ uuid: scope, name: scope }))}
            required={true}
          />
        {/if}
        <div class="flex flex-row gap-6">
          <Input
            title={capital($_("name"))}
            id="name"
            bind:value={$name.value}
            startValue={cls.name}
            errors={$name.errors}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            title={capital($_("user_key"))}
            info={$_("user_key_tooltip")}
            id="user-key"
            bind:value={$userKey.value}
            startValue={cls.user_key}
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
          $_("edit_item", {
            values: { item: $_("class", { values: { n: 1 } }) },
          })
        )}
        disabled={!hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
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
{/await}
