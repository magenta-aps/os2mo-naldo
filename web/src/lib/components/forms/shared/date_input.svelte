<script lang="ts">
  export let title: string | undefined = undefined
  export let id: string
  export let name = id
  export let value: string | number | undefined = undefined
  export let required = false
  export let min = "1910-01-01"
  export let max: string | undefined = undefined
</script>

{#if title}
  <label for={id} class="pb-1">
    <p>{title}</p>
  </label>
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
/>
