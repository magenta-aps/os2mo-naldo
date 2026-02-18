<script lang="ts">
  import { _ } from "svelte-i18n"
  export let title: string | undefined = undefined
  export let id: string
  export let name: string = id
  export let value: string
  export let startValue: string | undefined = undefined
  export let checked: boolean = startValue === value
  export let extra_classes = ""
  export let noPadding: boolean = false
  export let disabled: boolean = false
</script>

<div class="form-control {noPadding ? '' : 'pb-3'}">
  <label
    class="label text-sm text-base-content cursor-pointer p-0 wrap-break-word {noPadding
      ? ''
      : 'pb-1'} gap-4 {disabled ? 'text-base-content/50' : ''}"
  >
    <input
      type="checkbox"
      {id}
      {name}
      {value}
      {checked}
      class="checkbox checkbox-primary {extra_classes} rounded-sm normal-case font-normal text-base text-base-100"
      {disabled}
    />
    {#if title}
      <label for={id}>{title}</label>
    {/if}
  </label>
</div>
