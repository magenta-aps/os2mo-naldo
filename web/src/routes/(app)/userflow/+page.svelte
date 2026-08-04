<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { step } from "$lib/stores/stepStore"
  import { steps } from "$lib/userflow/registry"
  import Stepper from "$lib/components/userflow/Stepper.svelte"
</script>

<div class="flex align-center px-6 pt-6 pb-4">
  <h1 class="mb-4">{capital($_("userflow"))}</h1>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<div class="mx-6">
  <Stepper />

  <div class="mt-8">
    <!-- Keyed on the step: steps 2-5 share the EntityStep component, and
         svelte:component only remounts when `this` changes — without the key,
         local state (selected tab, field forms) would leak across steps. -->
    {#key $step}
      <svelte:component
        this={steps[$step - 1].component}
        {...steps[$step - 1].props ?? {}}
      />
    {/key}
  </div>
</div>
