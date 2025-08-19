<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { step } from "$lib/stores/stepStore"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import OnboardingFormButtons from "$lib/components/userflow/OnboardingFormButtons.svelte"
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
  const cprRegex = /^\d{6}[- ]?\d{4}$/

  $: cpr = $employeeInfo?.cprNumber?.cpr_no ?? ""
  $: cprErrors =
    $employeeInfo.validated === false
      ? cpr.length === 0
        ? ["required"]
        : !cprRegex.test(cpr)
        ? ["pattern"]
        : []
      : []
</script>

<form
  on:submit|preventDefault={async () => {
    if (await employeeInfo.validateForm()) {
      step.updateStep("inc")
    }
  }}
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
            bind:cprNumber={$employeeInfo.cprNumber.cpr_no}
            errors={cprErrors}
          />
          <!-- If we get a response with empty name property, it means that a fictional CPR-number has been entered. -->
          <!-- Therefore we allow typing a name, rather than making the input read-only. -->
          {#if $employeeInfo.cprNumber && $employeeInfo.cprNumber.name === ""}
            <div class="flex flex-row gap-6">
              <Input
                title={capital($_("givenname", { values: { n: 2 } }))}
                id="first-name"
                bind:value={$employeeInfo.firstName}
                errors={$employeeInfo.validated === false && !$employeeInfo.firstName
                  ? ["required"]
                  : []}
                extra_classes="basis-1/2"
                required={true}
              />
              <Input
                title={capital($_("surname"))}
                id="last-name"
                bind:value={$employeeInfo.lastName}
                errors={$employeeInfo.validated === false && !$employeeInfo.lastName
                  ? ["required"]
                  : []}
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
                errors={$employeeInfo.validated === false && !$employeeInfo.firstName
                  ? ["required"]
                  : []}
                extra_classes="basis-1/2"
                required={true}
                readonly
              />
              <Input
                title={capital($_("surname"))}
                id="last-name"
                bind:value={$employeeInfo.lastName}
                errors={$employeeInfo.validated === false && !$employeeInfo.lastName
                  ? ["required"]
                  : []}
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
            errors={cprErrors}
            required={true}
          />
          <div class="flex flex-row gap-6">
            <Input
              title={capital($_("givenname", { values: { n: 2 } }))}
              id="first-name"
              bind:value={$employeeInfo.firstName}
              errors={$employeeInfo.validated === false && !$employeeInfo.firstName
                ? ["required"]
                : []}
              extra_classes="basis-1/2"
              required={true}
            />
            <Input
              title={capital($_("surname"))}
              id="last-name"
              bind:value={$employeeInfo.lastName}
              errors={$employeeInfo.validated === false && !$employeeInfo.lastName
                ? ["required"]
                : []}
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
    <OnboardingFormButtons isFirst={true} />
    <Error />
  {/await}
</form>
