<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import { OwnerDocument, UpdateOwnerDocument } from "./query.generated"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getPersonValidities } from "$lib/http/getValidities"
  import { findClosestValidity } from "$lib/utils/validities"
  import { normalizeOwner } from "$lib/utils/normalizeForm"

  gql`
    query Owner($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      owners(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            owner(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
              validity {
                from
                to
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

    mutation UpdateOwner($input: OwnerUpdateInput!, $date: DateTime!) {
      owner_update(input: $input) {
        current(at: $date) {
          person {
            name
          }
        }
      }
    }
  `

  let startDate: string = $date
  let toDate: string
  let selectedPerson: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const svelteForm = form(fromDate)

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateOwnerDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit_item", {
                  values: {
                    item: $_("owner", { values: { n: 0 } }),
                    name: mutation.owner_update.current?.person?.[0].name,
                  },
                })
              ),
              uuid: $page.params.uuid,
              type: "employee",
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

  $: {
    ;(async () => {
      validities = selectedPerson
        ? await getPersonValidities(selectedPerson?.uuid)
        : { from: null, to: null }
    })()
  }

  let initialOwner: any = null
  let hasChanges = false
  $: if (initialOwner) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged = selectedPerson?.uuid !== initialOwner.person

    const toDateExtended =
      toDate === "" ? initialOwner.to !== null : toDate > (initialOwner.to ?? null)
    hasChanges = editableChanged || toDateExtended
  }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("owner", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("owner", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( OwnerDocument, { uuid: $page.params.owner, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to") } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const ownerObj = data.owners.objects[0].validities[0]}
  {#if !initialOwner}
    {@html (() => {
      initialOwner = normalizeOwner(ownerObj)
      return ""
    })()}
  {/if}

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
            startValue={ownerObj.validity.to
              ? ownerObj.validity.to.split("T")[0]
              : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <Search
          type="employee"
          bind:value={selectedPerson}
          startValue={ownerObj.owner
            ? {
                uuid: findClosestValidity(ownerObj.owner, startDate).uuid,
                name: findClosestValidity(ownerObj.owner, startDate).name,
              }
            : undefined}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("owner", { values: { n: 1 } }) },
          })
        )}
        disabled={!hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/employee/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
