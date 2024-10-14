<script lang="ts">
  import { step } from "$lib/stores/stepStore"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { addressInfo } from "$lib/stores/addressInfoStore"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { AddressFacetsDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { form, field } from "svelte-forms"
  import { required, email, pattern } from "svelte-forms/validators"
  import AddressInput from "$lib/components/userflow/AddressInput.svelte"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import DarSearch from "$lib/components/DARSearch.svelte"
  import { Addresses } from "$lib/util/addresses"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  gql`
    query AddressFacets($currentDate: DateTime!) {
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
    }
  `

  const fromDate = field("from", "", [required()])
  const addressTypeField = field("address_type", "", [required()])
  let addressField = field("", "")
  $: svelteForm = form(fromDate, addressTypeField, addressField)

  // Reactive statement for $addressInfo.addressType?.name, since calling the store, will override it
  // and therefore rerun the switch-statement and empty the list of errors.
  $: addressTypeName = $addressInfo.addressType?.name

  $: switch (addressTypeName) {
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

  const validateForm = async () => {
    await svelteForm.validate()
    if ($svelteForm.valid) {
      addressInfo.isValid(true)
      step.updateStep("inc")
    } else {
      addressInfo.isValid(false)
    }
  }
</script>

<form on:submit|preventDefault={async () => await validateForm()}>
  {#await graphQLClient().request(AddressFacetsDocument, { currentDate: $date })}
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
      </div>
    </div>
  {:then data}
    {@const facets = data.facets.objects}

    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$addressInfo.fromDate}
            bind:validationValue={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            required={true}
          />
          <DateInput
            bind:value={$addressInfo.toDate}
            title={capital($_("date.end_date"))}
            id="to"
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("visibility"))}
            id="visibility"
            bind:value={$addressInfo.visibility}
            iterable={getClassesByFacetUserKey(facets, "visibility")}
            extra_classes="basis-1/2"
            isClearable={true}
          />
          <Select
            title={capital($_("address_type"))}
            id="address-type"
            bind:value={$addressInfo.addressType}
            bind:name={$addressTypeField.value}
            errors={$addressTypeField.errors}
            on:change={() => ($addressInfo.addressValue = "")}
            iterable={getClassesByFacetUserKey(facets, "employee_address_type")}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <Input
          title={capital($_("description"))}
          id="user-key"
          bind:value={$addressInfo.userkey}
        />
        <!-- FIXME: Translate address_types -->
        <!-- FIXME: When value is empty, this doesn't show placeholder -->
        {#if $addressInfo.addressType.scope}
          {#if $addressInfo.addressType.scope === "DAR"}
            <DarSearch
              title={$addressInfo.addressType.name}
              id="value"
              startValue={typeof $addressInfo.addressValue === "object"
                ? {
                    tekst: $addressInfo.addressValue.name,
                    adresse: { id: $addressInfo.addressValue.value },
                    adgangsadresse: { id: $addressInfo.addressValue.value },
                  }
                : undefined}
              bind:darValue={$addressInfo.addressValue}
              bind:darName={$addressField.value}
              errors={$addressField.errors}
              required={true}
            />
          {:else}
            <AddressInput
              title={$addressInfo.addressType.name}
              id="value"
              bind:value={$addressInfo.addressValue}
              bind:validationField={$addressField.value}
              errors={$addressField.errors}
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
        >{capital($_("next"))}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => step.updateStep("dec")}
      >
        {capital($_("back"))}
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => step.updateStep("inc")}
      >
        {capital($_("skip"))}
      </button>
    </div>
    <Error />
  {/await}
</form>
