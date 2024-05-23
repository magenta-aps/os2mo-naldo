<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
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
  import { form, field } from "svelte-forms"
  import { required, email, pattern, url } from "svelte-forms/validators"
  import { Addresses } from "$lib/util/addresses"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities } from "$lib/util/helpers"

  let toDate: string
  let addressType: { name: string; user_key: string; uuid: string; scope: string }
  $: addressTypeUuid = addressType?.uuid

  // update the field depending on address-type
  const fromDate = field("from", "", [required()])
  const addressTypeField = field("address_type", "", [required()])
  let addressField = field("", "")
  $: svelteForm = form(fromDate, addressTypeField, addressField)

  gql`
    query AddressAndFacets($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      facets(filter: { user_keys: ["org_unit_address_type", "visibility"] }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              name
              uuid
              user_key
              scope
            }
          }
        }
      }
      addresses(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            value
            name
            user_key
            address_type {
              name
              uuid
              user_key
            }
            visibility {
              name
              user_key
              uuid
            }
            validity {
              from
              to
            }
            org_unit(filter: { from_date: null, to_date: null }) {
              validity {
                from
                to
              }
            }
          }
        }
      }
    }

    mutation UpdateAddress($input: AddressUpdateInput!) {
      address_update(input: $input) {
        objects {
          name
          org_unit {
            name
          }
        }
      }
    }
  `

  $: switch (addressType?.name) {
    case Addresses.AFDELINGSKODE:
      addressField = field(Addresses.AFDELINGSKODE, "", [required()])
      break
    case Addresses.EAN_NUMMER:
      addressField = field(Addresses.EAN_NUMMER, "", [required(), pattern(/^\d{13}$/)])
      break
    case Addresses.EMAIL:
      addressField = field(Addresses.EMAIL, "", [required(), email()])
      break
    case Addresses.FAX:
      // Jeg ved ikke hvordan en fax kan se ud, det gør MO heller ikke
      addressField = field(Addresses.FAX, "", [required(), pattern(/\d+/)])
      break
    case Addresses.FORMAALSKODE:
      addressField = field(Addresses.FORMAALSKODE, "", [required()])
      break
    case Addresses.HENVENDELSESSTED:
      addressField = field(Addresses.HENVENDELSESSTED, "", [required()])
      break
    case Addresses.LOKATION:
      addressField = field(Addresses.LOKATION, "", [required()])
      break
    case Addresses.P_NUMMER:
      addressField = field(Addresses.P_NUMMER, "", [required(), pattern(/^\d{10}$/)])
      break
    case Addresses.POSTADRESSE:
      addressField = field(Addresses.POSTADRESSE, "", [required()])
      break
    case Addresses.RETURADRESSE:
      addressField = field(Addresses.RETURADRESSE, "", [required()])
      break
    case Addresses.SKOLEKODE:
      addressField = field(Addresses.SKOLEKODE, "", [required()])
      break
    case Addresses.TELEFON:
      // This regex is not perfect, as it allows ex. `12345678` and `+45123456`, but use it for now
      addressField = field(Addresses.TELEFON, "", [required(), pattern(/(\+45)?\d{8}/)])
      break
    case Addresses.WEBADRESSE:
      // URL skal have http(s), ftp, git eller svn :shrug: Skal vi acceptere `www.lol.dk`?
      // `url()` er måske lidt for aggressiv.
      addressField = field(Addresses.WEBADRESSE, "", [required(), url()])
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
              message: capital(
                $_("success_edit", {
                  values: {
                    item: $_("address", { values: { n: 0 } }),
                    name: mutation.address_update.objects[0]?.org_unit?.[0].name,
                  },
                })
              ),
              uuid: $page.params.uuid,
              type: "organisation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
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
  {@const validities = getMinMaxValidities(
    data.addresses.objects[0].validities[0].org_unit
  )}

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
            min={$fromDate.value}
            max={validities.to}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("visibility"))}
            id="visibility"
            startValue={address.visibility ? address.visibility : undefined}
            iterable={getClassesByFacetUserKey(facets, "visibility")}
            extra_classes="basis-1/2"
            isClearable={true}
          />
          <Select
            title={capital($_("address_type"))}
            id="address-type"
            startValue={address.address_type ? address.address_type : undefined}
            bind:value={addressType}
            bind:name={$addressTypeField.value}
            errors={$addressTypeField.errors}
            iterable={getClassesByFacetUserKey(facets, "org_unit_address_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <input hidden name="address-type-uuid" bind:value={addressTypeUuid} />
        </div>
        <Input
          startValue={address.user_key !== address.value ? address.user_key : undefined}
          title={capital($_("description"))}
          id="user-key"
        />
        {#if addressType}
          {#if addressType.scope === "DAR"}
            <DarSearch
              title={addressType.name}
              startValue={{
                tekst: address.name,
                adresse: { id: address.value },
                adgangsadresse: { id: address.value },
              }}
              bind:darName={$addressField.value}
              errors={$addressField.errors}
              id="value"
              required={true}
            />
          {:else}
            <Input
              title={addressType.name}
              startValue={address.name}
              bind:value={$addressField.value}
              errors={$addressField.errors}
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
        >{capital(
          $_("edit_item", {
            values: { item: $_("address", { values: { n: 1 } }) },
          })
        )}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  </form>
{/await}
