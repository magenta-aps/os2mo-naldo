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
  import { CreateAddressDocument } from "./query.generated"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import DarSearch from "$lib/components/forms/shared/DARSearch.svelte"
  import { form, field } from "svelte-forms"
  import { required, email, pattern, url } from "svelte-forms/validators"
  import { Addresses } from "$lib/constants/addresses"
  import type { FacetValidities } from "$lib/utils/classes"
  import { getClasses } from "$lib/http/getClasses"
  import { getValidities } from "$lib/http/getValidities"

  gql`
    mutation CreateAddress($input: AddressCreateInput!, $date: DateTime!) {
      address_create(input: $input) {
        uuid
        current(at: $date) {
          org_unit(filter: { from_date: null, to_date: null }) {
            name
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
  let addressField = field("", "")
  $: svelteForm = form(fromDate, addressTypeField, addressField)

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
      addressField = field(Addresses.TELEFON, "", [required(), pattern(/^\+?\d+$/)])
      break
    case Addresses.WEBADRESSE:
      // URL skal have http(s), ftp, git eller svn :shrug: Skal vi acceptere `www.lol.dk`?
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
            const mutation = await graphQLClient().request(CreateAddressDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("address", { values: { n: 0 } }),
                    name: mutation.address_create.current?.org_unit?.[0]?.name,
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

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  let facets: FacetValidities[]
  let abortController: AbortController
  $: {
    // Abort the previous request if a new one is about to start
    if (abortController) abortController.abort()
    abortController = new AbortController()

    // Make sure `currentDate` isn't sent if startDate is null.
    const params = {
      currentDate: startDate,
      orgUuid: $page.params.uuid,
      facetUserKeys: ["org_unit_address_type", "visibility"],
    }

    ;(async () => {
      validities = $page.params.uuid
        ? await getValidities($page.params.uuid)
        : { from: null, to: null }
      try {
        facets = await getClasses(params, abortController.signal)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err)
        }
      }
    })()
  }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("address", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("address", { values: { n: 1 } }) },
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
      {#if facets}
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("visibility"))}
            id="visibility"
            iterable={filterClassesByFacetUserKey(facets, "visibility")}
            extra_classes="basis-1/2"
            isClearable={true}
          />
          <Select
            title={capital($_("address_type"))}
            id="address-type"
            bind:value={addressType}
            bind:name={$addressTypeField.value}
            errors={$addressTypeField.errors}
            iterable={filterClassesByFacetUserKey(facets, "org_unit_address_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <input hidden name="address-type-uuid" bind:value={addressTypeUuid} />
        </div>
      {/if}
      <Input title={capital($_("description"))} id="user-key" />
      {#if addressType}
        {#if addressType.scope === "DAR"}
          <DarSearch
            title={addressType.name}
            id="value"
            bind:darName={$addressField.value}
            errors={$addressField.errors}
            required={true}
          />
        {:else}
          <Input
            title={addressType.name}
            id="value"
            bind:value={$addressField.value}
            errors={$addressField.errors}
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
        $_("create_item", {
          values: { item: $_("address", { values: { n: 1 } }) },
        })
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      href="{base}/organisation/{$page.params.uuid}"
    />
  </div>
  <Error />
</form>
