<script lang="ts">
  export let title: string
  export let id: string
  export let name = id
  export let value: string | number
  export let required = false
</script>

<label for={id} class="pb-1">
  <p>{title}</p>
</label>
<input
  {id}
  {name}
  bind:value
  type="text"
  class="input input-bordered input-sm rounded text-base text-secondary font-normal w-full active:outline-offset-0 active:input-primary focus:outline-offset-0 focus:input-primary"
  {required}
/>
