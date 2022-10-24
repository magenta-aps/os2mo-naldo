<script lang="ts">
  import Icon from "$lib/components/icon.svelte"

  export let input: string
  export let cardView: boolean
</script>

<div class="bg-slate-100 rounded border border-slate-300 shadow-sm">
  <div class="grid grid-cols-4 m-5">
    <input
      type="text"
      placeholder="Søg"
      class="input input-bordered"
      bind:value={input}
    />
  </div>
</div>

<div class="flex justify-end gap-4">
  <label>
    <input
      type="radio"
      class="radio w-0 h-0 opacity-0"
      value={false}
      bind:group={cardView}
    />
    <div
      class="{!cardView
        ? 'bg-accent'
        : ''} cursor-pointer border rounded border border-slate-300 p-2"
    >
      <Icon type="bars" />
    </div>
  </label>
  <label>
    <input
      type="radio"
      class="radio w-0 h-0 opacity-0"
      value={true}
      bind:group={cardView}
    />
    <div
      class="{cardView
        ? 'bg-accent'
        : ''} cursor-pointer border rounded border border-slate-300 p-2"
    >
      <Icon type="grid" />
    </div>
  </label>
</div>
