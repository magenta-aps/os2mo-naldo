<script lang="ts">
  export let title: string
  export let id: string
  export let name = id
  export let value: string | number | undefined
  export let required = false
  export let min = "1910-01-01"
  export let max: string
</script>

<label for={id} class="pb-1">
  <p>{title}</p>
</label>
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
