<script lang="ts">
  import { step } from "$lib/stores/stepStore"
  import Step1 from "$lib/components/brugeropret/step1.svelte"
  import Step2 from "$lib/components/brugeropret/step2.svelte"

  $: {
    console.log($step)
  }
</script>

{#if $step === 1}
  <Step1 />
{:else if $step === 2}
  <Step2 />
{:else}
  LOL
{/if}

<!-- https://github.com/mdeme01/svelte-multi-step-form/blob/main/src/lib/components/personal-info.svelte -->
<!-- https://svelte-multi-step-form.vercel.app/ -->
