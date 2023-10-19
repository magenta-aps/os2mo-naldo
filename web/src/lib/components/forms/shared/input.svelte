<script lang="ts">
  export let title: string | undefined = undefined
  export let size: string = "sm"
  export let id: string
  export let name = id
  export let value: string | number | null | undefined = undefined
  export let startValue: string | number | null | undefined = undefined
  value = value ?? startValue // For flexibility when binding
  export let required = false
  export let placeholder: string | undefined = undefined
  export let type = "text"
  export let disabled = false
  export let pattern: string | undefined = undefined
  export let patternMessage: string | undefined = undefined
  export let extra_classes = ""
  export let errors: string[] = []

  const typeAction = (node: any) => {
    node.type = type
  }
</script>

<div class="form-control pb-3 {extra_classes}">
  <div class="pb-1">
    {#if title || required}
      <label for={id} class="text-sm text-secondary pb-1">
        {title ? title : ""}
        {required ? "*" : ""}
      </label>
    {/if}
    <input
      use:typeAction
      title={patternMessage}
      {pattern}
      {id}
      {name}
      {placeholder}
      bind:value
      type="text"
      class="input input-bordered input-{size} rounded text-base text-secondary font-normal w-full focus:outline-offset-0
     {errors.length ? 'input-error' : 'focus:input-primary'}"
      {disabled}
    />
  </div>

  {#each errors as error}
    {#if error === "required"}
      <span class="label-text-alt text-error block">{title} skal udfyldes</span>
    {/if}

    {#if error === "not_an_email"}
      <span class="label-text-alt text-error block">{title} er ikke gyldig</span>
    {/if}

    {#if error === "pattern"}
      <span class="label-text-alt text-error block">{title} har forkert format</span>
    {/if}
  {/each}
</div>
