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

  gql`
    query Class($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      classes(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            name
            facet(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              user_key
            }
            it_system(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              user_key
              name
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
  let chosenFacet: { name: string; uuid: string; user_key?: string }

  let chosenItSystem: { name: string; uuid: string; user_key?: string } | undefined =
    undefined
  let itSystems: ITSystem[] | undefined = undefined

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  const userKey = field("user_key", "", [required()])
  const svelteForm = form(fromDate, name, userKey)

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  $: if (chosenFacet) {
    ;(async () => {
      validities = await getFacetValidities(chosenFacet.uuid)
    })()
  } else {
    validities = { from: null, to: null }
  }

  let itSystemController: AbortController
  $: if (chosenFacet && chosenFacet?.user_key === "role" && !itSystems && startDate) {
    if (itSystemController) itSystemController.abort()
    itSystemController = new AbortController()
    ;(async () => {
      try {
        const res = await graphQLClient(itSystemController.signal).request(
          GetItSystemsDocument,
          {
            fromDate: startDate,
          }
        )
        // Map to the format the Select component expects
        itSystems = res.itsystems.objects
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Failed to fetch IT Systems:", err)
      }
    })()
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

{#await graphQLClient().request( ClassDocument, { uuid: $page.params.class, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to") } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  {capital($_("loading"))}
{:then data}
  {@const cls = data.classes.objects[0].validities[0]}
  {@const facet = data.classes.objects[0].validities[0].facet}

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
            min={validities.from}
            max={toDate ? toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={cls.validity.to ? cls.validity.to.split("T")[0] : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <Select
          title={capital($_("facet", { values: { n: 1 } }))}
          id="facet"
          bind:value={chosenFacet}
          startValue={{
            uuid: facet.uuid,
            name: capital(
              $_("facets.name." + facet.user_key, { default: facet.user_key })
            ),
            user_key: facet.user_key,
          }}
          required={true}
          extra_classes="basis-1/2"
          disabled
        />

        {#if itSystems}
          <Select
            title={capital($_("itsystem", { values: { n: 1 } }))}
            id="itsystem"
            bind:value={chosenItSystem}
            startValue={cls.it_system
              ? {
                  uuid: cls.it_system.uuid,
                  name: cls.it_system.name,
                }
              : undefined}
            iterable={formatITSystemNames(itSystems)}
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
