<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { step } from "$lib/stores/stepStore"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import { form, field } from "svelte-forms"
  import { required, pattern } from "svelte-forms/validators"
  import CprLookup from "$lib/components/forms/shared/CPRLookup.svelte"
  import CPRInput from "$lib/components/userflow/CPRInput.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { GetSpConfigDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  gql`
    query GetSPConfig {
      configuration(filter: { identifiers: "enable_sp" }) {
        objects {
          jsonified_value
          key
        }
      }
    }
  `

  $: {
    const name = $employeeInfo.cprNumber?.name

    if (name && name.trim() !== "") {
      $employeeInfo.firstName = name.split(" ").slice(0, -1).join(" ")
      $employeeInfo.lastName = name.split(" ").slice(-1).join(" ")
    } else if (name === undefined) {
      // name should only be undefined when SP is enabled, therefore we can clear the names when this is true
      $employeeInfo.firstName = ""
      $employeeInfo.lastName = ""
    }
  }

  const cprNumber = field("cpr_number", undefined, [
    required(),
    pattern(/^\d{6}\d{4}$/),
  ])
  const firstName = field("first_name", "", [required()])
  const lastName = field("last_name", "", [required()])
  const svelteForm = form(cprNumber, firstName, lastName)

  const validateOnFocusOut = async () => {
    await svelteForm.validate()
    employeeInfo.isValid($svelteForm.valid)
  }

  const validateOnFormSubmit = async () => {
    await svelteForm.validate()
    if ($svelteForm.valid) {
      employeeInfo.isValid(true)
      step.updateStep("inc")
    } else {
      employeeInfo.isValid(false)
    }
  }
</script>

<form
  on:submit|preventDefault={async () => await validateOnFormSubmit()}
  on:focusout={async () => await validateOnFocusOut()}
>
  {#await graphQLClient().request(GetSpConfigDocument)}
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <Skeleton />
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
    {@const SpEnabled = data.configuration.objects[0].jsonified_value === "true"}
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        {#if SpEnabled}
          <CprLookup
            title={capital($_("cpr_number"))}
            id="cpr-number"
            bind:value={$employeeInfo.cprNumber}
            bind:cprNumber={$cprNumber.value}
            errors={$cprNumber.errors}
          />
          <!-- If we get a response with empty name property, it means that a fictional CPR-number has been entered. -->
          <!-- Therefore we allow typing a name, rather than making the input read-only. -->
          {#if $employeeInfo.cprNumber && $employeeInfo.cprNumber.name === ""}
            <div class="flex flex-row gap-6">
              <Input
                title={capital($_("givenname", { values: { n: 2 } }))}
                id="first-name"
                bind:value={$employeeInfo.firstName}
                bind:cprName={$firstName.value}
                errors={$firstName.errors}
                extra_classes="basis-1/2"
                required={true}
              />
              <Input
                title={capital($_("surname"))}
                id="last-name"
                bind:value={$employeeInfo.lastName}
                bind:cprName={$lastName.value}
                errors={$lastName.errors}
                extra_classes="basis-1/2"
                required={true}
              />
            </div>
          {:else}
            <div class="flex flex-row gap-6">
              <Input
                title={capital($_("givenname", { values: { n: 2 } }))}
                id="first-name"
                bind:value={$employeeInfo.firstName}
                bind:cprName={$firstName.value}
                errors={$firstName.errors}
                extra_classes="basis-1/2"
                required={true}
                readonly
              />
              <Input
                title={capital($_("surname"))}
                id="last-name"
                bind:value={$employeeInfo.lastName}
                bind:cprName={$lastName.value}
                errors={$lastName.errors}
                extra_classes="basis-1/2"
                required={true}
                readonly
              />
            </div>
          {/if}
        {:else}
          <CPRInput
            title={capital($_("cpr_number"))}
            id="cpr-number"
            startValue={$employeeInfo.cprNumber.cpr_no}
            bind:cprObject={$employeeInfo.cprNumber}
            bind:cprNumber={$cprNumber.value}
            errors={$cprNumber.errors}
            required={true}
          />
          <div class="flex flex-row gap-6">
            <Input
              title={capital($_("givenname", { values: { n: 2 } }))}
              id="first-name"
              bind:value={$employeeInfo.firstName}
              bind:cprName={$firstName.value}
              errors={$firstName.errors}
              extra_classes="basis-1/2"
              required={true}
            />
            <Input
              title={capital($_("surname"))}
              id="last-name"
              bind:value={$employeeInfo.lastName}
              bind:cprName={$lastName.value}
              errors={$lastName.errors}
              extra_classes="basis-1/2"
              required={true}
            />
          </div>
        {/if}
        <div class="flex flex-row gap-6">
          <Input
            title={capital($_("nickname_givenname", { values: { n: 2 } }))}
            id="nickname-first-name"
            bind:value={$employeeInfo.nicknameFirstname}
            extra_classes="basis-1/2"
          />
          <Input
            title={capital($_("nickname_surname"))}
            id="nickname-last-name"
            bind:value={$employeeInfo.nicknameLastname}
            extra_classes="basis-1/2"
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital($_("next"))}</button
      >
    </div>
    <Error />
  {/await}
</form>
