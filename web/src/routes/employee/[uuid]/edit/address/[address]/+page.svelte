<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import SelectNew from "$lib/components/forms/shared/selectNew.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { AddressAndFacetsDocument, UpdateAddressDocument } from "./query.generated"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import DarSearch from "$lib/components/DARSearch.svelte"
  import { Addresses } from "$lib/util/addresses"
  import { form, field } from "svelte-forms"
  import { required, email, pattern } from "svelte-forms/validators"

  let toDate: string
  let addressType: { name: string; user_key: string; uuid: string }
  $: addressTypeUuid = addressType?.uuid

  // update the field depending on address-type
  const fromDate = field("from", "", [required()])
  const addressTypeField = field("address_type", "", [required()])
  let addressField = field("", "")
  $: svelteForm = form(fromDate, addressTypeField, addressField)

  gql`
    query AddressAndFacets(
      $uuid: [UUID!]
      $fromDate: DateTime
      $employee_uuid: [UUID!]
    ) {
      facets(filter: { user_keys: ["employee_address_type", "visibility"] }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              uuid
              user_key
              name
            }
          }
        }
      }
      addresses(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
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
      employees(filter: { uuids: $employee_uuid, from_date: $fromDate }) {
        objects {
          objects {
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation UpdateAddress($input: AddressUpdateInput!) {
      address_update(input: $input) {
        objects {
          uuid
          employee {
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
      // This regex is not perfect, as it allows ex. `12345678` and `+45123456`, but use it for now
      addressField = field(Addresses.TELEFON, "", [required(), pattern(/(\+45)?\d{8}/)])
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
            })
            $success = {
              message: `Adressen ${
                mutation.address_update.objects[0].employee
                  ? `for ${mutation.address_update.objects[0].employee[0].name}`
                  : ""
              } redigeres fra d. ${$fromDate.value}`,
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

{#await graphQLClient().request( AddressAndFacetsDocument, { uuid: $page.params.address, fromDate: $date, employee_uuid: $page.params.uuid } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const address = data.addresses.objects[0].objects[0]}
  {@const facets = data.facets.objects}
  {@const minDate = data.employees.objects[0].objects[0].validity?.from.split("T")[0]}
  {@const maxDate = data.employees.objects[0].objects[0].validity?.to?.split("T")[0]}

  <title>Rediger adresse | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger adresse</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={address.validity.to ? address.validity.to.split("T")[0] : null}
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>
        <div class="flex flex-row gap-6">
          <SelectNew
            title="Synlighed"
            id="visibility"
            startValue={address.visibility ? address.visibility : undefined}
            iterable={getClassesByFacetUserKey(facets, "visibility")}
            extra_classes="basis-1/2"
          />
          <SelectNew
            title="Adressetype"
            id="address-type"
            startValue={address.address_type ? address.address_type : undefined}
            bind:value={addressType}
            bind:name={$addressTypeField.value}
            errors={$addressTypeField.errors}
            iterable={getClassesByFacetUserKey(facets, "employee_address_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <input hidden name="address-type-uuid" bind:value={addressTypeUuid} />
        </div>
        {#if addressType}
          {#if addressType.name === Addresses.POSTADRESSE}
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
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger adresse</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
