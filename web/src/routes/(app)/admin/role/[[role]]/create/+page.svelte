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
  import {
    GetItSystemsDocument,
    GetRoleFacetDocument,
    CreateRoleDocument,
  } from "./query.generated"
  import { formatITSystemNames, type ITSystem } from "$lib/utils/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { onMount } from "svelte"
  import { getFacetValidities } from "$lib/http/getValidities"

  gql`
    query GetRoleFacet($fromDate: DateTime!) {
      facets(filter: { user_keys: ["role"], from_date: $fromDate }) {
        objects {
          current(at: $fromDate) {
            uuid
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

    mutation CreateRole($input: ClassCreateInput!, $date: DateTime!) {
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
            const mutation = await graphQLClient().request(CreateRoleDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("role", { values: { n: 0 } }),
                    name: mutation.class_create.current?.name,
                  },
                })
              ),
              type: "role",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  const fromDate = field("from", "", [required()])
  const itSystemField = field("itsystem", "", [required()])
  const name = field("name", "", [required()])
  const userKey = field("user_key", "", [required()])
  const svelteForm = form(fromDate, itSystemField, name, userKey)

  let startDate: string = $date
  let toDate: string

  let roleFacetUuid: string | undefined

  let chosenItSystem: { name: string; uuid: string; user_key?: string } | undefined
  let itSystems: ITSystem[] | undefined

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  const itSystemFromUrl = $page.url.searchParams.get("itsystem")

  onMount(async () => {
    const [facetRes, itSystemRes] = await Promise.all([
      graphQLClient().request(GetRoleFacetDocument, { fromDate: startDate }),
      graphQLClient().request(GetItSystemsDocument, { fromDate: startDate }),
    ])
    roleFacetUuid = facetRes.facets.objects[0]?.current?.uuid
    itSystems = itSystemRes.itsystems.objects
    if (roleFacetUuid) {
      validities = await getFacetValidities(roleFacetUuid)
    }
  })

  $: startValueItSystem =
    itSystems && itSystemFromUrl
      ? formatITSystemNames(itSystems).find((its) => its.uuid === itSystemFromUrl)
      : undefined
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("role", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("role", { values: { n: 1 } }) },
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

      {#if itSystems}
        <Select
          title={capital($_("itsystem", { values: { n: 1 } }))}
          id="itsystem"
          bind:value={chosenItSystem}
          bind:name={$itSystemField.value}
          errors={$itSystemField.errors}
          startValue={startValueItSystem}
          iterable={formatITSystemNames(itSystems)}
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
      <input hidden id="facet" name="facet" value={roleFacetUuid ?? ""} />
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("role", { values: { n: 1 } }) },
        })
      )}
      disabled={!roleFacetUuid}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      href="{base}/admin/role"
    />
  </div>
  <Error />
</form>
