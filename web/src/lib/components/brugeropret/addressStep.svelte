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

  let addressField = field("", "")
  $: svelteForm = form(addressField)

  $: addressTypeUuid = $addressInfo.addressType?.uuid

  $: switch ($addressInfo.addressType?.name) {
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
</script>

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

<form on:submit|preventDefault={() => step.updateStep("inc")} class="mx-6">
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
            iterable={getClassesByFacetUserKey(facets, "employee_address_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <input hidden name="address-type-uuid" bind:value={addressTypeUuid} />
        </div>
        <Input title={capital($_("description"))} id="user-key" />
        <!-- FIXME: Translate address_types -->
        {#if $addressInfo.addressType}
          {#if $addressInfo.addressType.scope === "DAR"}
            <DarSearch
              title={$addressInfo.addressType.name}
              id="value"
              bind:darName={$addressInfo.addressValue}
              bind:errors={$addressField.errors}
              required={true}
            />
          {:else}
            <Input
              title={$addressInfo.addressType.name}
              id="value"
              bind:value={$addressInfo.addressValue}
              bind:errors={$addressField.errors}
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
    </div>
    <Error />
  {/await}
</form>
