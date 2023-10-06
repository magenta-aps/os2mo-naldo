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
  import { FacetsAndOrgDocument, CreateAddressDocument } from "./query.generated"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import DarSearch from "$lib/components/DARSearch.svelte"

  let fromDate: string
  let toDate: string
  let addressType: { name: string; uuid?: any | null }
  $: addressUuid = addressType?.uuid

  gql`
    query FacetsAndOrg($uuid: [UUID!], $fromDate: DateTime) {
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
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
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

    mutation CreateAddress($input: AddressCreateInput!) {
      address_create(input: $input) {
        uuid
        objects {
          org_unit {
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
          const mutation = await graphQLClient().request(CreateAddressDocument, {
            input: result.data,
          })
          $success = {
            message: `Adressen ${
              mutation.address_create.objects[0]?.org_unit
                ? `for ${mutation.address_create.objects[0].org_unit[0].name}`
                : ""
            } er oprettet fra d. ${fromDate}`,
            uuid: $page.params.uuid,
            type: "organisation",
          }
        } catch (err) {
          $error = { message: err }
        }
      }
    }
</script>

{#await graphQLClient().request( FacetsAndOrgDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const facets = data.facets.objects}
  {@const minDate = data.org_units.objects[0].objects[0].validity?.from.split("T")[0]}
  {@const maxDate = data.org_units.objects[0].objects[0].validity?.to?.split("T")[0]}

  <title>Opret adresse | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Opret adresse</h3>
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
            iterable={getClassesByFacetUserKey(facets, "visibility")}
            extra_classes="basis-1/2"
          />
          <Select
            title="Adressetype"
            id="address-type"
            bind:value={addressType}
            iterable={getClassesByFacetUserKey(facets, "org_unit_address_type")}
            extra_classes="basis-1/2"
            returnType="object"
            required={true}
          />
          <input hidden name="address-type-uuid" bind:value={addressUuid} />
        </div>
        {#if addressType}
          {#if addressType.name == "Afdelingskode"}
            <Input title="Afdelingskode" id="value" required={true} />
          {:else if addressType.name == "Email"}
            <Input title="Email" id="value" type="email" required={true} />
          {:else if addressType.name == "P-nummer"}
            <Input title="P-nummer" id="value" required={true} />
          {:else if addressType.name == "Postadresse"}
            <DarSearch title="Postadresse" />
          {:else if addressType.name == "Webadresse"}
            <Input
              title="Weabdresse"
              id="value"
              type="url"
              pattern="^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$"
              patternMessage="Indtast en gyldig url"
              required={true}
            />
          {:else if addressType.name == "Formålskode"}
            <Input title="Formålskode" id="value" required={true} />
          {:else if addressType.name == "Lokation"}
            <Input title="Lokation" id="value" required={true} />
          {:else if addressType.name == "EAN-nummer"}
            <Input title="EAN-nummer" id="value" required={true} />
          {:else if addressType.name == "Skolekode"}
            <Input title="Skolekode" id="value" required={true} />
          {:else if addressType.name == "Fax"}
            <Input title="Fax" id="value" required={true} />
          {:else if addressType.name == "Returadresse"}
            <DarSearch title="Returadresse" />
          {:else if addressType.name == "Henvendelsessted"}
            <DarSearch title="Henvendelsessted" />
          {:else if addressType.name == "Telefon"}
            <Input
              title="Telefon"
              id="value"
              type="tel"
              pattern="[0-9]+"
              patternMessage="Kun tal & '+' er tilladt"
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
        >Opret adresse</button
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
