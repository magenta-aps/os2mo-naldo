<script lang="ts">
  import { _ } from "svelte-i18n"
  export let title: string | undefined = undefined
  export let id: string
  export let value: string
  export let startValue: string | undefined = undefined
  export let extra_classes = ""
  export let noPadding: boolean = false
  export let disabled: boolean = false
</script>

<div class="form-control {noPadding ? '' : 'pb-3'}">
  <label
    class="label cursor-pointer p-0 {noPadding ? '' : 'pb-1'} gap-4 {disabled
      ? 'text-gray-400'
      : ''}"
  >
    <input
      type="checkbox"
      {id}
      name={id}
      {value}
      checked={startValue === value}
      class="checkbox checkbox-primary {extra_classes} rounded normal-case font-normal text-base text-base-100"
      {disabled}
    />
    {#if title}
      <label for={id}>{title}</label>
    {/if}
  </label>
</div>
