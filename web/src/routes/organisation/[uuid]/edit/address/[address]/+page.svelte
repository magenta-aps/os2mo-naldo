<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { AddressAndFacetsDocument, UpdateAddressDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import DarSearch from "$lib/components/DARSearch.svelte"

  let fromDate: string
  let toDate: string
  let addressType: { name: string; uuid?: any | null }
  $: addressUuid = addressType?.uuid

  gql`
    query AddressAndFacets(
      $uuid: [UUID!]
      $org_unit_uuid: [UUID!]
      $fromDate: DateTime
    ) {
      facets(filter: { user_keys: ["org_unit_address_type", "visibility"] }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              name
              uuid
              user_key
            }
          }
        }
      }
      addresses(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            value
            name
            address_type {
              name
              uuid
            }
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
      org_units(filter: { uuids: $org_unit_uuid }) {
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
          name
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
            message: `${mutation.address_update.objects[0].name} er blevet redigeret`,
            uuid: $page.params.uuid,
            type: "organisation",
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( AddressAndFacetsDocument, { uuid: $page.params.address, fromDate: $date, org_unit_uuid: $page.params.uuid } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const address = data.addresses.objects[0].objects[0]}
  {@const facets = data.facets.objects}
  {@const minDate = data.org_units.objects[0].objects[0].validity.from.split("T")[0]}
  {@const maxDate = data.org_units.objects[0].objects[0].validity.to?.split("T")[0]}

  <title>Rediger adresse | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger adresse</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
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
            min={fromDate}
            max={maxDate ? maxDate : null}
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
            startValue={address.address_type.name}
            iterable={getClassesByFacetUserKey(facets, "org_unit_address_type")}
            extra_classes="basis-1/2"
            returnType="object"
            required={true}
          />
          <input hidden name="address-type-uuid" bind:value={addressUuid} />
        </div>
        {#if addressType}
          <!-- FIXME: -->
          <!-- Kan vi på en eller anden måde sørge for at det kun er den "rigtige" value der får startvalue? -->
          <!-- Denne løsning gør at alle input-felter får adress.value, selvom valuen ikke passer til adressetypen -->
          <!-- I praksis gør det bare at der ikke automatisk kommer et tomt felt, når man skifter adressetype -->
          {#if addressType.name == "Afdelingskode"}
            <Input
              title="Afdelingskode"
              id="value"
              startValue={address.name}
              required={true}
            />
          {:else if addressType.name == "Email"}
            <Input
              title="Email"
              id="value"
              type="email"
              startValue={address.name}
              required={true}
            />
          {:else if addressType.name == "P-nummer"}
            <Input
              title="P-nummer"
              id="value"
              startValue={address.name}
              required={true}
            />
          {:else if addressType.name == "Postadresse"}
            <DarSearch
              title="Postadresse"
              startValue={{
                tekst: address.name,
                adresse: { id: address.value },
                adgangsadresse: { id: address.value },
              }}
              required={true}
            />
          {:else if addressType.name == "Webadresse"}
            <Input
              title="Weabdresse"
              id="value"
              type="url"
              pattern="^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$"
              patternMessage="Indtast en gyldig url"
              startValue={address.name}
              required={true}
            />
          {:else if addressType.name == "Formålskode"}
            <Input
              title="Formålskode"
              id="value"
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
          {:else if addressType.name == "EAN-nummer"}
            <Input
              title="EAN-nummer"
              id="value"
              startValue={address.name}
              required={true}
            />
          {:else if addressType.name == "Skolekode"}
            <Input
              title="Skolekode"
              id="value"
              startValue={address.name}
              required={true}
            />
          {:else if addressType.name == "Fax"}
            <Input title="Fax" id="value" startValue={address.name} required={true} />
          {:else if addressType.name == "Returadresse"}
            <DarSearch
              title="Returadresse"
              startValue={{
                tekst: address.name,
                adresse: { id: address.value },
                adgangsadresse: { id: address.value },
              }}
              required={true}
            />
          {:else if addressType.name == "Henvendelsessted"}
            <!-- TODO: DAR input field? -->
            <DarSearch
              title="Henvendelsessted"
              startValue={{
                tekst: address.name,
                adresse: { id: address.value },
                adgangsadresse: { id: address.value },
              }}
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
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
