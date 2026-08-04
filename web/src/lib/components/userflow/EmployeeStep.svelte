<script lang="ts">
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { step } from "$lib/stores/stepStore"
  import Error from "$lib/components/alerts/Error.svelte"
  import OnboardingFormButtons from "$lib/components/userflow/OnboardingFormButtons.svelte"
  import EmployeeFields from "$lib/components/forms/entity/EmployeeFields.svelte"

  let fields: EmployeeFields
</script>

<form
  on:submit|preventDefault={async () => {
    const isValid = await fields.validate()
    // The stamped flag drives the Stepper checkmark and the summary.
    employeeInfo.setValidated(isValid)
    if (isValid) {
      step.updateStep("inc")
    }
  }}
>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <div class="p-8">
      <EmployeeFields bind:value={$employeeInfo} bind:this={fields} />
    </div>
  </div>
  <OnboardingFormButtons />
  <Error />
</form>
