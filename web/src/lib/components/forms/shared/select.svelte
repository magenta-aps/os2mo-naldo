<script lang="ts">
  enum Return {
    NAME = "name",
    UUID = "uuid",
    OBJECT = "object",
  }

  type ReturnType = `${Return}`

  export let title: string | undefined = undefined
  export let id: string
  export let name = id
  export let value: string | object | undefined = undefined
  export let iterable: any[] | undefined = undefined
  export let required = false
  export let returnType: ReturnType = "uuid"
  export let disabled = false
  export let startValue: string | undefined = undefined
  export let extra_classes = ""
</script>

<div class="form-control pb-4 {extra_classes}">
  {#if title || required}
    <label for={id} class="text-sm text-secondary pb-1">
      {title ? title : ""}
      {required ? "*" : ""}
    </label>
  {/if}
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
          <option selected={element.name === startValue} value={element.name}
            >{element.name}</option
          >
        {:else if returnType === Return.UUID}
          <option selected={element.name === startValue} value={element.uuid}
            >{element.name}</option
          >
        {:else if returnType === Return.OBJECT}
          <option selected={element.name === startValue} value={element}
            >{element.name}</option
          >
        {/if}
      {/each}
    {/if}
  </select>
</div>
