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
    GetRoleFacetDocument,
    UpdateRoleDocument,
    RoleDocument,
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

    query Role(
      $uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $currentDate: DateTime
    ) {
      classes(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            name
            facet_uuid
            it_system_response {
              uuid
              current(at: $currentDate) {
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

    mutation UpdateRole($input: ClassUpdateInput!, $date: DateTime!) {
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
            const mutation = await graphQLClient().request(UpdateRoleDocument, {
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

  let chosenItSystem: { name: string; uuid: string; user_key?: string } | undefined
  let itSystems: ITSystem[] | undefined

  const queryVariables = {
    uuid: $page.params.role,
    fromDate: $page.url.searchParams.get("from"),
    toDate: $page.url.searchParams.get("to"),
    currentDate: startDate,
  }

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  let itSystemController: AbortController
  $: if (startDate) {
    if (itSystemController) itSystemController.abort()
    itSystemController = new AbortController()
    ;(async () => {
      try {
        const res = await graphQLClient(itSystemController.signal).request(
          GetItSystemsDocument,
          { fromDate: startDate }
        )
        itSystems = res.itsystems.objects
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Failed to fetch IT Systems:", err)
      }
    })()
  }

  onMount(async () => {
    const res = await graphQLClient().request(GetRoleFacetDocument, {
      fromDate: startDate,
    })
    const roleFacetUuid = res.facets.objects[0]?.current?.uuid
    if (roleFacetUuid) {
      validities = await getFacetValidities(roleFacetUuid)
    }
  })
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("role", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("role", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request(RoleDocument, queryVariables)}
  <!-- TODO: Should have a skeleton for the loading stage -->
  {capital($_("loading"))}
{:then data}
  {@const role = data.classes.objects[0].validities[0]}

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
            startValue={role.validity.to ? role.validity.to.split("T")[0] : null}
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
            startValue={role.it_system_response?.current
              ? {
                  uuid: role.it_system_response.uuid,
                  name: role.it_system_response.current.name,
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
            startValue={role.name}
            errors={$name.errors}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            title={capital($_("user_key"))}
            info={$_("user_key_tooltip")}
            id="user-key"
            bind:value={$userKey.value}
            startValue={role.user_key}
            errors={$userKey.errors}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <input hidden id="facet" name="facet" value={role.facet_uuid} />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("role", { values: { n: 1 } }) },
          })
        )}
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
{/await}
