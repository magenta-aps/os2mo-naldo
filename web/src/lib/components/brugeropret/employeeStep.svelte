<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { step } from "$lib/stores/stepStore"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
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

  // TODO: Add error-handling
</script>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("employee", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form on:submit|preventDefault={() => step.updateStep("inc")} class="mx-6">
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
        <!-- TODO: Support SP, like in `employee -> create` -->
        <Input
          title={capital($_("cpr_number"))}
          id="cpr-number"
          bind:value={$employeeInfo.cprNumber}
          required={true}
        />
        <div class="flex flex-row gap-6">
          <Input
            title={capital($_("givenname", { values: { n: 2 } }))}
            id="first-name"
            bind:value={$employeeInfo.firstName}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            title={capital($_("surname"))}
            id="last-name"
            bind:value={$employeeInfo.lastName}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
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
