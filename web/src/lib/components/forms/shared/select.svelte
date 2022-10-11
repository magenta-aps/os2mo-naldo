<script lang="ts">
  enum Return {
    NAME = "name",
    UUID = "uuid",
    OBJECT = "object",
  }

  type ReturnType = `${Return}`

  export let title: string
  export let id: string
  export let name = id
  export let value: string | object | undefined = undefined
  export let iterable: any[] | undefined = undefined
  export let required = false
  export let returnType: ReturnType = "uuid"
  export let disabled = false
</script>

<label for={id} class="pb-1">
  <p>{title}</p>
</label>
<select
  {id}
  {name}
  class="select select-bordered select-sm text-base text-secondary font-normal w-full rounded active:select-primary focus:select-primary active:outline-offset-0 focus:outline-offset-0"
  bind:value
  {required}
  {disabled}
>
  {#if !disabled && iterable}
    {#each iterable as element}
      {#if returnType === Return.NAME}
        <option value={element.name}>{element.name}</option>
      {:else if returnType === Return.UUID}
        <option value={element.uuid}>{element.name}</option>
      {:else if returnType === Return.OBJECT}
        <option value={element}>{element.name}</option>
      {/if}
    {/each}
  {/if}
</select>
