<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { step } from "$lib/stores/stepStore"
  import EmployeeStep from "$lib/components/brugeropret/employeeStep.svelte"
  import EngagementStep from "$lib/components/brugeropret/engagementStep.svelte"
  import ItUserStep from "$lib/components/brugeropret/ituserStep.svelte"
  import ManagerStep from "$lib/components/brugeropret/managerStep.svelte"
  import AddressStep from "$lib/components/brugeropret/addressStep.svelte"
  import Stepper from "$lib/components/brugeropret/Stepper.svelte"
  import SummaryStep from "$lib/components/brugeropret/SummaryStep.svelte"
</script>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital($_("flow"))}
  </h3>
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
      <ItUserStep />
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
