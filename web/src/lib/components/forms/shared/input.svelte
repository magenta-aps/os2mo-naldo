<script lang="ts">
  export let title: string | undefined = undefined
  export let size: string = "sm"
  export let id: string
  export let name = id
  export let value: string | number | null
  export let required = false
  export let placeholder: string | undefined = undefined
  export let type = "text"
  export let pattern: string | undefined = undefined
  export let patternMessage: string | undefined = undefined
  
  const typeAction = (node: any) => {
    node.type = type
  }
</script>

{#if title}
  <label for={id} class="pb-1">
    <p>{title}</p>
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
/> 
