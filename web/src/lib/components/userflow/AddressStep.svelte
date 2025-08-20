<script lang="ts">
  import { step } from "$lib/stores/stepStore"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { addressInfo } from "$lib/stores/addressInfoStore"
  import { graphQLClient } from "$lib/http/client"
  import { AddressFacetsDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { form, field } from "svelte-forms"
  import { required, email, pattern } from "svelte-forms/validators"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { Addresses } from "$lib/constants/addresses"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import AddressInput from "$lib/components/userflow/AddressInput.svelte"
  import DarSearch from "$lib/components/forms/shared/DARSearch.svelte"
  import OnboardingFormButtons from "$lib/components/userflow/OnboardingFormButtons.svelte"
  import OnboardingTab from "$lib/components/userflow/OnboardingTab.svelte"
  import Error from "$lib/components/alerts/Error.svelte"

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
  let selectedTab = 0
  $: address = $addressInfo[selectedTab] ?? $addressInfo[0]

  let addressField = field("", "")

  $: {
    switch (address.addressType?.name) {
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
        addressField = field("", "")
        break
    }
  }
</script>

<form
  on:submit|preventDefault={async () => {
    if (await addressInfo.validateForm()) {
      step.updateStep("inc")
    }
  }}
>
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
      <OnboardingTab
        items={$addressInfo}
        label="address"
        addItem={addressInfo.addAddress}
        removeItem={addressInfo.removeAddress}
        selectedIndex={selectedTab}
        setSelectedIndex={(i) => (selectedTab = i)}
      />
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={address.fromDate ? address.fromDate : $date}
            bind:value={address.fromDate}
            errors={address.validated === false && !address.fromDate
              ? ["required"]
              : []}
            title={capital($_("date.start_date"))}
            id="from"
            required
          />
          <DateInput
            bind:value={address.toDate}
            title={capital($_("date.end_date"))}
            id="to"
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("visibility"))}
            id="visibility"
            bind:value={address.visibility}
            iterable={filterClassesByFacetUserKey(facets, "visibility")}
            extra_classes="basis-1/2"
            isClearable
          />
          <Select
            title={capital($_("address_type"))}
            id="address-type"
            bind:value={address.addressType}
            errors={address.validated === false && !address.addressType?.uuid
              ? ["required"]
              : []}
            on:change={() => (address.addressValue = { name: "", value: "" })}
            iterable={filterClassesByFacetUserKey(facets, "employee_address_type")}
            extra_classes="basis-1/2"
            required
          />
        </div>
        <Input
          title={capital($_("description"))}
          id="user-key"
          bind:value={address.userkey}
        />
        {#if address.addressType}
          {#if address.addressType.scope === "DAR"}
            <DarSearch
              title={address.addressType.name}
              id="value"
              startValue={address.addressValue
                ? {
                    tekst: address.addressValue.name,
                    adresse: { id: address.addressValue.value },
                    adgangsadresse: { id: address.addressValue.value },
                  }
                : undefined}
              bind:darValue={address.addressValue}
              errors={address.validated === false && !address.addressValue.value
                ? ["required"]
                : []}
              on:clear={() => (address.addressValue = { name: undefined, value: "" })}
              required
            />
          {:else}
            <!-- This combines the specific value-validation and the general form validation -->
            <AddressInput
              title={address.addressType.name}
              id="value"
              bind:value={address.addressValue.value}
              bind:validationField={$addressField.value}
              errors={address.validated === false && !address.addressValue.value
                ? ["required", ...$addressField.errors]
                : [...$addressField.errors]}
              required
            />
          {/if}
        {/if}
      </div>
    </div>
    <OnboardingFormButtons />
    <Error />
  {/await}
</form>
