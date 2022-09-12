<script lang="ts">
  export let time: string = "Nutid"
  export let headers: string[]
</script>

<h1 class="text-lg py-4">{time}</h1>

<div class="overflow-x-auto">
  <table class="table border-seperate" style="width: 100;">
    <thead>
      <tr class="[&>*]:bg-base-100 border">
        {#each headers as header}
          <th>{header}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      <slot />
    </tbody>
  </table>
</div>
