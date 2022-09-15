<script lang="ts">
  export let time: string = "Nutid"
  export let headers: string[]
</script>

<h1 class="text-lg py-4">{time}</h1>

<div class="overflow-x-auto">
  <table class="border-collapse rounded-lg w-full">
    <thead class="bg-slate-100 text-left">
      <tr>
        {#each headers as header}
          <th
            class="px-4 py-3 text-xs font-medium leading-4 tracking-wider text-left text-secondary border-b border-gray-200 bg-slate-100"
          >
            {header}</th
          >
        {/each}
      </tr>
    </thead>
    <tbody class="border border-l-2 border-slate-300 min-h-64 text-slate-600 text-sm">
      <slot />
    </tbody>
  </table>
</div>
