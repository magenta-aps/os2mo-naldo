<script lang="ts">
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { step } from "$lib/stores/stepStore"
  import EmployeeStep from "$lib/components/brugeropret/employeeStep.svelte"
  import EngagementStep from "$lib/components/brugeropret/engagementStep.svelte"
  import ItUserStep from "$lib/components/brugeropret/ituserStep.svelte"
  import ManagerStep from "$lib/components/brugeropret/managerStep.svelte"
  import AddressStep from "$lib/components/brugeropret/addressStep.svelte"

  $: {
    console.log($engagementInfo)
  }
</script>

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
{/if}

<!-- https://github.com/mdeme01/svelte-multi-step-form/blob/main/src/lib/components/personal-info.svelte -->
<!-- https://svelte-multi-step-form.vercel.app/ -->
