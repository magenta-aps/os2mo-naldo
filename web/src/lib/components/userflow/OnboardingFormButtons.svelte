<script lang="ts">
  import { step } from "$lib/stores/stepStore"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Button from "$lib/components/shared/Button.svelte"
  import { resetUserflowStores } from "$lib/stores/resetStores"
  export let isFirst: boolean = false
</script>

{#if isFirst}
  <div class="flex py-6 gap-4">
    <Button type="submit" title={capital($_("next"))} />
  </div>
{:else}
  <div class="sm:w-full md:w-3/4 xl:w-1/2 flex justify-between py-6 gap-4">
    <div class="flex gap-4">
      <Button
        type="button"
        title={capital($_("back"))}
        outline={true}
        on:click={() => step.updateStep("dec")}
      />
      <Button type="submit" title={capital($_("next"))} />
      <Button
        type="button"
        title={capital($_("skip"))}
        outline={true}
        on:click={() => step.updateStep("inc")}
      />
    </div>
    <Button
      type="button"
      title={capital($_("start_over"))}
      outline={true}
      on:click={() => resetUserflowStores()}
    />
  </div>
{/if}
