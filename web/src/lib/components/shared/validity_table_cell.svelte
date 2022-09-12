<script lang="ts">
  interface Validity {
    from: string
    to?: string
  }

  export let validity: Validity

  const formatDate = (date: string): Date => {
    return new Date(date).toLocaleString("da-DK", {
      dateStyle: "long",
    })
  }
</script>

<td class="whitespace-nowrap">
  <div>
    <span class="text-gray-400 inline-block min-w-[5rem]">Startdato</span>
    {formatDate(validity.from)}
  </div>
  {#if validity.to}
    <div>
      <span class="text-gray-400 inline-block min-w-[5rem]">Slutdato</span>
      {formatDate(validity.to)}
    </div>
  {/if}
</td>
