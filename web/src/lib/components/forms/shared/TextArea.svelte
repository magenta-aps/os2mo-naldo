<script lang="ts">
  import { _ } from "svelte-i18n"
  export let title: string | undefined = undefined
  export let size: string = "sm"
  export let id: string
  export let name = id
  export let value: string | number | null | undefined = undefined
  export let startValue: string | number | null | undefined = undefined
  value = startValue ? startValue : value
  export let required = false
  export let placeholder: string | undefined = undefined
  export let disabled = false
  export let extra_classes = ""
  export let errors: string[] = []
</script>

<div class="form-control pb-3 {extra_classes}">
  <div class="pb-1 text-secondary">
    {#if title || required}
      <label for={id} class="text-sm pb-1">
        {title ? title : ""}
        {required ? "*" : ""}
      </label>
    {/if}
    <textarea
      {title}
      {id}
      {name}
      {placeholder}
      bind:value
      class="textarea textarea-bordered max-h-96 textarea-{size} rounded text-base font-normal w-full focus:outline-0
          {errors.length ? 'textarea-error' : 'focus:textarea-primary'}"
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
