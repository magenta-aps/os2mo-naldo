<script lang="ts">
  interface Element {
    name: string
    uuid: string
  }

  export let title: string
  export let id: string
  export let value: string
  export let iterable: Element[]
  export let required = false
</script>

<label for={id} class="pb-1">
  <p>{title}</p>
</label>
<select
  {id}
  class="select select-bordered select-sm text-base text-secondary font-normal w-full rounded active:select-primary focus:select-primary active:outline-offset-0 focus:outline-offset-0"
  bind:value
  {required}
>
  {#each iterable as element}
    <option value={element.uuid}>{element.name}</option>
  {/each}
</select>
