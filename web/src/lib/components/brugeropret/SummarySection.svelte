<script>
  export let title
  export let data
</script>

<div class="section">
  <h2>{title}</h2>
  {#each Object.entries(data) as [key, value]}
    <p><strong>{key}</strong>: {value}</p>
  {/each}
</div>

<style>
  .section {
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 8px;
  }

  h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  p {
    margin: 0.5rem 0;
  }
</style>
