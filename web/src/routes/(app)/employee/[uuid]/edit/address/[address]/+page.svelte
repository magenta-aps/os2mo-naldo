<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import AddressInput from "$lib/components/forms/shared/AddressInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { AddressAndFacetsDocument, UpdateAddressDocument } from "./query.generated"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { FacetValidities } from "$lib/utils/classes"
  import type { SubmitFunction } from "./$types"
  import { onDestroy } from "svelte"
  import { getPersonValidities } from "$lib/http/getValidities"
  import { getClasses } from "$lib/http/getClasses"
  import DarSearch from "$lib/components/forms/shared/DARSearch.svelte"
  import { form, field } from "svelte-forms"
  import { required, email, pattern } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { normalizeAddress } from "$lib/utils/normalizeForm"

  gql`
    query AddressAndFacets($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      addresses(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            value
            address_type_response {
              uuid
              current(at: $fromDate) {
                user_key
                name
              }
            }
            name
            value
            visibility_response {
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

    mutation UpdateAddress($input: AddressUpdateInput!, $date: DateTime!) {
      address_update(input: $input) {
        current(at: $date) {
          person_response {
            uuid
            current(at: $date) {
              name
            }
          }
        }
      }
    }
  `

  let startDate: string = $date
  let toDate: string
  let addressType: { name: string; user_key: string; uuid: string; scope: string }
  $: addressTypeUuid = addressType?.uuid

  // update the field depending on address-type
  const fromDate = field("from", "", [required()])
  const addressTypeField = field("address_type", "", [required()])
  const visibility = field("visibility", "", [])
  const description = field("description", "", [])

  let addressField = field("", "")
  $: svelteForm = form(
    fromDate,
    addressTypeField,
    addressField,
    visibility,
    description
  )

  // Derive validators from the address type's scope, not its name. The name is
  // customer-configurable, so matching on it left custom-named types in the
  // default branch where the field was never recreated — the value field didn't
  // clear and the validators didn't update when switching type.
  $: if (addressType) {
    switch (addressType.scope) {
      case "EMAIL":
        addressField = field(addressType.name, "", [required(), email()])
        break
      case "PHONE":
        addressField = field(addressType.name, "", [required(), pattern(/^\+?\d+$/)])
        break
      default:
        // DAR, TEXT and any other scope: value required only
        addressField = field(addressType.name, "", [required()])
        break
    }
  }

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateAddressDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit_item", {
                  values: {
                    item: $_("address", { values: { n: 0 } }),
                    name: mutation.address_update.current?.person_response?.current
                      ?.name,
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

  $: if ($page.params.uuid) {
    getPersonValidities($page.params.uuid).then((v) => { validities = v })
  }

  let facetsController: AbortController
  onDestroy(() => facetsController?.abort())

  $: facetsPromise = (() => {
    facetsController?.abort()
    facetsController = new AbortController()
    return startDate
      ? getClasses(
          {
            currentDate: startDate,
            orgUuid: null,
            facetUserKeys: ["employee_address_type", "visibility"],
          },
          facetsController.signal
        )
      : Promise.resolve([] as FacetValidities[])
  })()

  let initialAddress: any = null
  let hasChanges = false
  $: if (initialAddress) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged =
      $addressTypeField.value !== initialAddress.address_type ||
      $addressField.value !== initialAddress.value ||
      $visibility.value !== initialAddress.visibility ||
      $description.value !== initialAddress.user_key

    const toDateExtended =
      toDate === "" ? initialAddress.to !== null : toDate > (initialAddress.to ?? null)
    hasChanges = editableChanged || toDateExtended
  }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("address", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("address", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( AddressAndFacetsDocument, { uuid: $page.params.address, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to") } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const address = data.addresses.objects[0].validities[0]}
  {#if !initialAddress}
    {@html (() => {
      initialAddress = normalizeAddress(address)
      return ""
    })()}
  {/if}

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
            startValue={address.validity.to ? address.validity.to.split("T")[0] : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        {#await facetsPromise then facets}
          <div class="flex flex-row gap-6">
            <Select
              title={capital($_("visibility"))}
              id="visibility"
              bind:name={$visibility.value}
              startValue={address.visibility_response
                ? {
                    uuid: address.visibility_response.uuid,
                    name: address.visibility_response.current?.name ?? "",
                    user_key: address.visibility_response.current?.user_key ?? "",
                  }
                : undefined}
              iterable={filterClassesByFacetUserKey(facets, "visibility")}
              extra_classes="basis-1/2"
              on:clear={() => ($visibility.value = "")}
              isClearable={true}
            />
            <Select
              title={capital($_("address_type"))}
              id="address-type"
              startValue={address.address_type_response
                ? {
                    uuid: address.address_type_response.uuid,
                    name: address.address_type_response.current?.name ?? "",
                    user_key: address.address_type_response.current?.user_key ?? "",
                  }
                : undefined}
              bind:value={addressType}
              bind:name={$addressTypeField.value}
              errors={$addressTypeField.errors}
              iterable={filterClassesByFacetUserKey(facets, "employee_address_type")}
              extra_classes="basis-1/2"
              required={true}
            />
            <input hidden name="address-type-uuid" bind:value={addressTypeUuid} />
          </div>
        {:catch}
          <p class="text-sm text-error">{capital($_("load_error"))}</p>
        {/await}
        <Input
          startValue={address.user_key}
          title={capital($_("description"))}
          id="user-key"
          bind:value={$description.value}
        />
        {#if addressType}
          {#if addressType.scope === "DAR"}
            <DarSearch
              startValue={{
                tekst: address.name,
                adresse: { id: address.value },
                adgangsadresse: { id: address.value },
              }}
              bind:darName={$addressField.value}
              errors={$addressField.errors}
              title={addressType.name}
              id="value"
              required={true}
            />
          {:else}
            <!-- This is not perfectly implemented..-->
            <AddressInput
              title={addressType.name}
              startValue={address.name}
              bind:displayName={$addressField.value}
              errors={$addressField.errors}
              id="value"
              required={true}
            />
          {/if}
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("address", { values: { n: 1 } }) },
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
