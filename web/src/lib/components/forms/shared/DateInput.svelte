<script lang="ts">
  import { _ } from "svelte-i18n"
  export let title: string | undefined = undefined
  export let id: string
  export let name = id
  export let value: string | number | undefined
  export let validationValue: string | number | undefined = undefined
  export let startValue: string | number | undefined = undefined
  value = startValue ? startValue : value
  export let required = false
  export let disabled = false
  export let min: string | undefined | null = undefined
  export let max: string | undefined | null = undefined
  export let errors: string[] = []
  // We changed from `pb-4` to having `pb-3` and `pb-1`, which messed with the navbar DateInput.
  // This is a workaround.
  export let noPadding: Boolean = false

  $: {
    validationValue = value
  }
</script>

<div class="form-control basis-1/2 {noPadding ? '' : 'pb-3'}">
  <div class="text-secondary {noPadding ? '' : 'pb-1'}">
    {#if title || required}
      <label for={id} class="text-sm pb-1">
        {title ? title : ""}
        {required ? "*" : ""}
      </label>
    {/if}
    <input
      {id}
      {name}
      bind:value
      type="date"
      on:change
      {min}
      {max}
      class="input input-bordered input-sm rounded text-base text-secondary font-normal w-full cursor-pointer focus:outline-0 {errors.length
        ? 'input-error'
        : 'focus:input-primary'}"
      {disabled}
    />
  </div>
  {#each errors as error}
    {#if error === "required"}
      <span class="label-text-alt text-error block"
        >{$_("validation.is_required", { values: { field: title } })}</span
      >
    {/if}
  {/each}
</div>
