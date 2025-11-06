<script lang="ts">
  import { _ } from "svelte-i18n"
  export let title: string | undefined = undefined
  export let id: string
  export let name: string = id
  export let value: string
  export let startValue: string | undefined = undefined
  export let extra_classes = ""
  export let noPadding: boolean = false
  export let disabled: boolean = false
</script>

<div class="form-control {noPadding ? '' : 'pb-3'}">
  <label
    class="label text-sm text-secondary cursor-pointer p-0 wrap-break-word {noPadding
      ? ''
      : 'pb-1'} gap-4 {disabled ? 'text-gray-400' : ''}"
  >
    <input
      type="radio"
      {id}
      {name}
      {value}
      checked={startValue === value}
      class="checkbox checkbox-primary {extra_classes} rounded-sm normal-case font-normal text-base text-base-100"
      {disabled}
    />
    {#if title}
      <label for={id}>{title}</label>
    {/if}
  </label>
</div>

<style>
  /* Styling removes the minus-sign in the checkbox when the selected value isn't displayed on the screen. */
  .checkbox:indeterminate {
    background-color: transparent !important;
    background-image: none !important;
  }

  .checkbox:indeterminate::before,
  .checkbox:indeterminate::after {
    content: none !important;
  }
</style>
