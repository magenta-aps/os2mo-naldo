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

<td>
  <div>
    Fra {formatDate(validity.from)}
  </div>
  {#if validity.to}
    <div>
      Til {formatDate(validity.to)}
    </div>
  {/if}
</td>
