<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { base } from "$app/paths"
  import { goto } from "$app/navigation"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import type { PolicyDeclareInput } from "$lib/graphql/types"
  import { CreatePolicyDocument } from "./query.generated"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Error from "$lib/components/alerts/Error.svelte"

  gql`
    mutation CreatePolicy($input: PolicyDeclareInput!) {
      policy_declare(input: $input) {
        uuid
        name
      }
    }
  `

  // Only the "policy" details step for now; more (e.g. actors, rules) will be
  // added later. The final step is always the summary.
  const POLICY_STEP = 1
  const SUMMARY_STEP = 2
  let currentStep = POLICY_STEP

  let name = ""
  let description = ""
  let startDate: string = $date
  let endDate = ""
  let showErrors = false

  $: nameErrors = showErrors && !name ? ["required"] : []
  $: startErrors = showErrors && !startDate ? ["required"] : []
  $: stepValid = !!name && !!startDate

  $: steps = [
    {
      step: POLICY_STEP,
      label: capital($_("policies", { values: { n: 1 } })),
      valid: stepValid,
    },
    { step: SUMMARY_STEP, label: capital($_("summary")), valid: false },
  ]

  const goToStep = (target: number) => {
    if (target === POLICY_STEP) {
      currentStep = POLICY_STEP
    } else {
      next()
    }
  }

  const next = () => {
    showErrors = true
    if (stepValid) currentStep = SUMMARY_STEP
  }

  const startOver = () => {
    name = ""
    description = ""
    startDate = $date
    endDate = ""
    showErrors = false
    currentStep = POLICY_STEP
  }

  const submit = async () => {
    const input: PolicyDeclareInput = {
      name,
      start: startDate,
      ...(description && { description }),
      ...(endDate && { end: endDate }),
    }
    try {
      const mutation = await graphQLClient().request(CreatePolicyDocument, { input })
      $success = {
        message: capital(
          $_("success_create_item", {
            values: {
              item: $_("policies", { values: { n: 0 } }),
              name: mutation.policy_declare.name,
            },
          })
        ),
      }
      startOver()
      goto(`${base}/admin/policies`)
    } catch (err) {
      $error = { message: err }
    }
  }
</script>

<title
  >{capital(
    $_("create_item", { values: { item: $_("policies", { values: { n: 1 } }) } })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", { values: { item: $_("policies", { values: { n: 1 } }) } })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<div class="mx-6">
  <div
    class="whitespace-wrap block xl:tabs tabs-border xxl:whitespace-nowrap w-full flex"
  >
    {#each steps as s}
      <button
        class="tab flex-1 text-center text-base hover:no-underline
          {s.step === currentStep ? 'tab-active text-primary' : 'text-base-content'}"
        on:click={() => goToStep(s.step)}
      >
        {`${s.step}. ${s.label}`}
        {s.valid ? "✓" : ""}
      </button>
    {/each}
  </div>

  <div class="mt-8">
    {#if currentStep === POLICY_STEP}
      <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
        <div class="p-8">
          <Input
            title={capital($_("name"))}
            id="name"
            bind:value={name}
            errors={nameErrors}
            required={true}
          />
          <TextArea
            title={capital($_("description"))}
            id="description"
            bind:value={description}
          />
          <div class="flex flex-row gap-6">
            <DateInput
              bind:value={startDate}
              errors={startErrors}
              title={capital($_("date.start_date"))}
              id="start"
              max={endDate ? endDate : null}
              required={true}
            />
            <DateInput
              bind:value={endDate}
              title={capital($_("date.end_date"))}
              id="end"
              min={startDate ? startDate : null}
            />
          </div>
        </div>
      </div>
      <div class="flex py-6 gap-4">
        <Button type="button" title={capital($_("next"))} on:click={next} />
        <Button
          type="button"
          title={capital($_("cancel"))}
          outline={true}
          href="{base}/admin/policies"
        />
      </div>
    {:else}
      <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
        <div class="p-8 space-y-5">
          <div>
            <h3 class="pb-2 text-primary">
              {capital($_("policies", { values: { n: 1 } }))}
            </h3>
            <dl class="grid gap-1">
              <div class="grid grid-cols-2">
                <dt>{capital($_("name"))}:</dt>
                <dd>{name}</dd>
              </div>
              <div class="grid grid-cols-2">
                <dt>{capital($_("description"))}:</dt>
                <dd>{description}</dd>
              </div>
              <div class="grid grid-cols-2">
                <dt>{capital($_("date.start_date"))}:</dt>
                <dd>{startDate}</dd>
              </div>
              <div class="grid grid-cols-2">
                <dt>{capital($_("date.end_date"))}:</dt>
                <dd>{endDate}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div
        class="sm:w-full md:w-3/4 xl:w-1/2 flex justify-between py-6 gap-4"
      >
        <div class="flex gap-4">
          <Button
            type="button"
            title={capital($_("back"))}
            outline={true}
            on:click={() => (currentStep = POLICY_STEP)}
          />
          <Button type="button" title={capital($_("submit"))} on:click={submit} />
        </div>
        <Button
          type="button"
          title={capital($_("start_over"))}
          outline={true}
          on:click={startOver}
        />
      </div>
    {/if}
  </div>
</div>

<Error />
