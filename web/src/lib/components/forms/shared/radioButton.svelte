<script lang="ts">
  import { createEventDispatcher } from "svelte"

  export let title: string | undefined = undefined
  export let id: string
  export let value: string
  export let startValue: string | undefined = undefined
  export let extra_classes = ""
  export let groupName: string

  const dispatch = createEventDispatcher()
  //TODO: find løsning der ikke påvirker alt i systemet, fjern denne event når der er testet færdig
  function handleRadioChange(event: Event) {
    const target = event.target as HTMLInputElement
    const isChecked = target.checked
    const uuid = target.id

    dispatch("radioChanged", { isChecked, uuid })
  }
</script>

<!--benyttet checkbox klasse for gøre radioButton og checkbox visuelt ens -->
<div class="form-control pb-4">
  <label class="label cursor-pointer p-0 gap-4">
    <input
      type="radio"
      {id}
      name={groupName}
      {value}
      checked={startValue === value}
      class="checkbox {extra_classes} rounded normal-case font-normal text-base text-base-100"
      on:change={handleRadioChange}
    />
    {#if title}
      <label for={id}>{title}</label>
    {/if}
  </label>
</div>
