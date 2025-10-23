<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
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
  import type { SubmitFunction } from "./$types"
  import DarSearch from "$lib/components/forms/shared/DARSearch.svelte"
  import { Addresses } from "$lib/constants/addresses"
  import { form, field } from "svelte-forms"
  import { required, email, pattern } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities } from "$lib/utils/validities"
  import { normalizeAddress } from "$lib/utils/normalizeForm"

  let toDate: string
  let addressType: { name: string; user_key: string; uuid: string; scope: string }
  $: addressTypeUuid = addressType?.uuid

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

  gql`
    query AddressAndFacets(
      $uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $employee_uuid: [UUID!]
      $currentDate: DateTime
    ) {
      facets(filter: { user_keys: ["employee_address_type", "visibility"] }) {
        objects {
          validities {
            uuid
            user_key
            classes(filter: { from_date: $currentDate }) {
              uuid
              user_key
              name
              scope
            }
          }
        }
      }
      addresses(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            value
            address_type {
              uuid
              user_key
              name
            }
            name
            value
            visibility {
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
      employees(filter: { uuids: $employee_uuid, from_date: null, to_date: null }) {
        objects {
          validities {
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
          person {
            name
          }
        }
      }
    }
  `

  $: switch (addressType?.name) {
    case Addresses.EMAIL:
      addressField = field(Addresses.EMAIL, "", [required(), email()])
      break
    case Addresses.LOKATION:
      addressField = field(Addresses.LOKATION, "", [required()])
      break
    case Addresses.POSTADRESSE:
      addressField = field(Addresses.POSTADRESSE, "", [required()])
      break
    case Addresses.TELEFON:
      addressField = field(Addresses.TELEFON, "", [required(), pattern(/^\+?\d+$/)])
      break
    default:
      break
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
                    name: mutation.address_update.current?.person?.[0].name,
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

{#await graphQLClient().request( AddressAndFacetsDocument, { uuid: $page.params.address, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to"), employee_uuid: $page.params.uuid, currentDate: $date } )}
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
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const address = data.addresses.objects[0].validities[0]}
  {@const facets = data.facets.objects}
  {@const validities = getMinMaxValidities(data.employees.objects[0].validities)}
  {#if !initialAddress}
    {@html (() => {
      initialAddress = normalizeAddress(address)
      return ""
    })()}
  {/if}

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
            startValue={address.validity.to ? address.validity.to.split("T")[0] : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("visibility"))}
            id="visibility"
            bind:name={$visibility.value}
            startValue={address.visibility ? address.visibility : undefined}
            iterable={filterClassesByFacetUserKey(facets, "visibility")}
            extra_classes="basis-1/2"
            on:clear={() => ($visibility.value = "")}
            isClearable={true}
          />
          <Select
            title={capital($_("address_type"))}
            id="address-type"
            startValue={address.address_type ? address.address_type : undefined}
            bind:value={addressType}
            bind:name={$addressTypeField.value}
            errors={$addressTypeField.errors}
            iterable={filterClassesByFacetUserKey(facets, "employee_address_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <input hidden name="address-type-uuid" bind:value={addressTypeUuid} />
        </div>
        <Input
          startValue={address.user_key !== address.value ? address.user_key : undefined}
          bind:value={$description.value}
          title={capital($_("description"))}
          id="user-key"
        />
        <!-- FIXME: Translate address_types -->
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
            <Input
              startValue={address.name}
              bind:value={$addressField.value}
              errors={$addressField.errors}
              title={addressType.name}
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
