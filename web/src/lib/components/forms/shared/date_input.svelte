<script lang="ts">
  export let title: string | undefined = undefined
  export let id: string
  export let name = id
  export let value: string | number | undefined
  export let startValue: string | number | undefined = undefined
  value ??= startValue
  export let required = false
  export let disabled = false
  export let min = "1910-01-01"
  export let max: string | undefined = undefined
  export let padding: string = "pb-4"
</script>
<div class="form-control basis-1/2 {padding}">
  {#if title}
    <label for={id} class="text-sm text-secondary pb-1">{title}</label>
  {/if}
  <input
    {id}
    {name}
    bind:value
    type="date"
    {min}
    {max}
    class="input input-bordered input-sm rounded text-base text-secondary font-normal w-full
        active:outline-offset-0 active:input-primary focus:outline-offset-0 focus:input-primary"
    {required}
    {disabled}
  />
</div>
