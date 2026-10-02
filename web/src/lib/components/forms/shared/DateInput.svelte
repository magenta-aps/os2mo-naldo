<script lang="ts">
  import { _ } from "svelte-i18n"
  import { Temporal } from "temporal-polyfill"

  export let title: string | undefined = undefined
  export let id: string
  // StartDateInput and EndDateInput pass "" and submit their own value.
  export let name = id
  // null once the user clears the field; undefined before it has a value.
  export let value: Temporal.PlainDate | null | undefined = undefined
  export let validationValue: Temporal.PlainDate | null | undefined = undefined
  export let startValue: Temporal.PlainDate | null | undefined = undefined
  value = startValue ?? value
  export let required = false
  export let disabled = false
  export let min: Temporal.PlainDate | null | undefined = undefined
  export let max: Temporal.PlainDate | null | undefined = undefined
  export let errors: string[] = []
  // We changed from `pb-4` to having `pb-3` and `pb-1`, which messed with the navbar DateInput.
  // This is a workaround.
  export let noPadding: Boolean = false

  // The browser's date field holds yyyy-MM-dd text, or "" when empty.
  let text = value?.toString() ?? ""
  $: if ((value?.toString() ?? "") !== text) text = value?.toString() ?? ""

  const onInput = (event: Event) => {
    text = (event.currentTarget as HTMLInputElement).value
    value = text ? Temporal.PlainDate.from(text) : null
  }

  $: validationValue = value
</script>

<div class="form-control basis-1/2 {noPadding ? '' : 'pb-3'}">
  <div class="text-base-content {noPadding ? '' : 'pb-1'}">
    {#if title || required}
      <label for={id} class="text-sm pb-1">
        {title ? title : ""}
        {required ? "*" : ""}
      </label>
    {/if}
    <input
      {id}
      {name}
      value={text}
      on:input={onInput}
      type="date"
      min={min?.toString()}
      max={max?.toString()}
      class="input input-bordered input-sm rounded text-base text-base-content font-normal w-full cursor-pointer focus:outline-0 {errors.length
        ? 'input-error'
        : 'focus:input-primary'}"
      {disabled}
    />
  </div>
  {#each errors as error}
    {#if error === "required"}
      <span class="text-xs text-error"
        >{$_("validation.is_required", { values: { field: title } })}</span
      >
    {/if}
  {/each}
</div>

<style>
  @supports selector(::-webkit-calendar-picker-indicator) {
    .input[type="date"],
    .input[type="datetime-local"],
    .input[type="month"],
    .input[type="week"],
    .input[type="time"] {
      padding-right: 2rem;
    }
  }
</style>
