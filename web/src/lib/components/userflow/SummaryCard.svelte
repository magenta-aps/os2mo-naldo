<script lang="ts">
  // One summary block: a heading, then per-instance subtitled dt/dd grids.
  // Replaces the five near-identical *Summary components.
  export let title: string
  export let sections: {
    subtitle?: string
    rows: { label: string; value: string | string[] }[]
  }[]
</script>

<div>
  <h3 class="text-primary">{title}</h3>
  {#each sections as section}
    <div class="grid gap-1 pb-2 text-base-content">
      {#if section.subtitle}
        <h4>{section.subtitle}</h4>
      {/if}
      <div class="pb-1">
        {#each section.rows as row}
          <div class="grid grid-cols-2">
            <span>{row.label}:</span>
            {#if Array.isArray(row.value)}
              <ul>
                {#each row.value as item}
                  <li>• {item}</li>
                {/each}
              </ul>
            {:else}
              <span>{row.value}</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
