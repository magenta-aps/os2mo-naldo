<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
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

  let fromDate: string
  let toDate: string
  let addressType: { name: string; uuid?: any | null }
  $: addressUuid = addressType?.uuid

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
              name
              uuid
            }
            name
            visibility {
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

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
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
            } redigeres fra d. ${fromDate}`,
            uuid: $page.params.uuid,
            type: "employee",
          }
        } catch (err) {
          $error = { message: err }
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
            bind:value={fromDate}
            startValue={$date}
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
            min={fromDate ? fromDate : minDate}
            max={maxDate}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title="Synlighed"
            id="visibility"
            startValue={address.visibility?.name}
            iterable={getClassesByFacetUserKey(facets, "visibility")}
            extra_classes="basis-1/2"
          />
          <Select
            title="Adressetype"
            id="address-type"
            bind:value={addressType}
            startValue={address.address_type.name}
            iterable={getClassesByFacetUserKey(facets, "employee_address_type")}
            required={true}
            extra_classes="basis-1/2"
            returnType="object"
          />
          <input hidden name="address-type-uuid" bind:value={addressUuid} />
        </div>
        {#if addressType}
          {#if addressType.name == "Email"}
            <Input
              title="Email"
              id="value"
              type="email"
              startValue={address.name}
              required={true}
            />
          {:else if addressType.name == "Lokation"}
            <Input
              title="Lokation"
              id="value"
              startValue={address.name}
              required={true}
            />
          {:else if addressType.name == "Postadresse"}
            <Input
              title="Postadresse"
              id="value"
              startValue={address.name}
              required={true}
            />
          {:else if addressType.name == "Telefon"}
            <Input
              title="Telefon"
              id="value"
              type="tel"
              pattern="[0-9]+"
              patternMessage="Kun tal & '+' er tilladt"
              startValue={address.name}
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
