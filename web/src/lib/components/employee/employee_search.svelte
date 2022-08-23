<script lang="ts">
  export let input: string
  export let cardView: boolean
</script>

<div class="card bg-base-200 shadow-xl">
  <div class="card-body grid grid-cols-2">
    <h2 class="card-title">Medarbejdere</h2>
    <input
      type="text"
      placeholder="Søg"
      class="input input-bordered"
      bind:value={input}
    />
    <div>
      <label>
        <input
          type="radio"
          name="radio-1"
          class="radio"
          value={true}
          bind:group={cardView}
        />
      </label>
      <label>
        <input
          type="radio"
          name="radio-1"
          class="radio"
          value={false}
          bind:group={cardView}
        />
      </label>
    </div>
  </div>
</div>
