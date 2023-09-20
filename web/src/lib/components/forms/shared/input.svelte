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

  const typeAction = (node: any) => {
    node.type = type
  }
</script>

<div class="form-control pb-4 {extra_classes}">
  {#if title}
    <label for={id} class="text-sm text-secondary pb-1">
      {title}
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
    class="input input-bordered input-{size} rounded text-base text-secondary font-normal w-full active:outline-offset-0 active:input-primary focus:outline-offset-0 focus:input-primary"
    {required}
    {disabled}
  />
</div>
