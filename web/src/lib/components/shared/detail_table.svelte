<script lang="ts">
  export let time: string = "Nutid"
  export let headers: string[]
</script>

<h2 class="py-4">{time}</h2>
<div class="overflow-x-auto rounded border mb-8">
  <table class="border-slate-300 w-full">
    {#if headers}
      <thead class="text-left">
        <tr>
          {#each headers as header}
            <th
              class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-100"
            >
              {header}</th
            >
          {/each}
        </tr>
      </thead>
    {/if}
    <tbody class="border-slate-300 min-h-64 text-slate-600">
      <slot />
    </tbody>
  </table>
</div>
