<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { step } from "$lib/stores/stepStore"
  import EmployeeStep from "$lib/components/userflow/EmployeeStep.svelte"
  import EngagementStep from "$lib/components/userflow/EngagementStep.svelte"
  import ItuserStep from "$lib/components/userflow/ItuserStep.svelte"
  import ManagerStep from "$lib/components/userflow/ManagerStep.svelte"
  import AddressStep from "$lib/components/userflow/AddressStep.svelte"
  import Stepper from "$lib/components/userflow/Stepper.svelte"
  import SummaryStep from "$lib/components/userflow/SummaryStep.svelte"
</script>

<div class="flex align-center px-6 pt-6 pb-4">
  <h1 class="mb-4">{capital($_("userflow"))}</h1>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<div class="mx-6">
  <Stepper />

  <div class="mt-8">
    {#if $step === 1}
      <EmployeeStep />
    {:else if $step === 2}
      <EngagementStep />
    {:else if $step === 3}
      <ItuserStep />
    {:else if $step === 4}
      <ManagerStep />
    {:else if $step === 5}
      <AddressStep />
    {:else if $step === 6}
      <SummaryStep />
    {/if}
  </div>
</div>

<!-- https://github.com/mdeme01/svelte-multi-step-form/blob/main/src/lib/components/personal-info.svelte -->
<!-- https://svelte-multi-step-form.vercel.app/ -->
