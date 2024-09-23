<script lang="ts">
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { step } from "$lib/stores/stepStore"
  import EmployeeStep from "$lib/components/brugeropret/employeeStep.svelte"
  import EngagementStep from "$lib/components/brugeropret/engagementStep.svelte"

  $: {
    console.log($engagementInfo)
  }
</script>

{#if $step === 1}
  <EmployeeStep />
{:else if $step === 2}
  <EngagementStep />
{/if}

<!-- https://github.com/mdeme01/svelte-multi-step-form/blob/main/src/lib/components/personal-info.svelte -->
<!-- https://svelte-multi-step-form.vercel.app/ -->
