<script lang="ts">
  import { _ } from "svelte-i18n"
  import Icon from "@iconify/svelte"
  import infoOutlineRounded from "@iconify/icons-material-symbols/info-outline-rounded"

  export let title: string | undefined = undefined
  export let size: string = "sm"
  export let id: string
  export let name: string = id
  export let startValue: string | number | null | undefined = undefined
  export let value: string | number | null | undefined = startValue || undefined
  export let displayName: string | number | undefined | null
  export let required = false
  export let placeholder: string | undefined = undefined
  export let type = "text"
  export let disabled = false
  export let pattern: string | undefined = undefined
  export let extra_classes = ""
  export let readonly: boolean = false
  export let errors: string[] = []
  export let info: string | undefined = undefined
  $: if (value) {
    displayName = value
  }

  const typeAction = (node: any) => {
    node.type = type
  }
</script>

<div class="form-control pb-3 {extra_classes}">
  <div class="pb-1 text-secondary">
    {#if title || required}
      <label for={id} class="text-sm pb-1">
        {title ? title : ""}
        {required ? "*" : ""}
        {#if info}
          <div class="tooltip tooltip-bottom" data-tip={info}>
            <Icon icon={infoOutlineRounded} width="15" height="15" />
          </div>
        {/if}
      </label>
    {/if}
    <input
      use:typeAction
      {title}
      {pattern}
      {id}
      {name}
      {placeholder}
      bind:value
      type="text"
      class="input input-bordered input-{size} rounded text-base font-normal w-full focus:outline-0
      {errors.length ? 'input-error' : 'focus:input-primary'}"
      {readonly}
      {disabled}
    />
  </div>

  {#each errors as error}
    {#if error === "required"}
      <span class="label-text-alt text-error block"
        >{$_("validation.is_required", { values: { field: title } })}</span
      >
    {/if}

    {#if error === "not_an_email"}
      <span class="label-text-alt text-error block"
        >{$_("validation.is_invalid", { values: { field: title } })}</span
      >
    {/if}

    {#if error === "pattern"}
      <span class="label-text-alt text-error block"
        >{$_("validation.is_wrong_format", { values: { field: title } })}</span
      >
    {/if}

    {#if error === "url"}
      <span class="label-text-alt text-error block"
        >{$_("validation.is_wrong_format", { values: { field: title } })}</span
      >
    {/if}
  {/each}
</div>
