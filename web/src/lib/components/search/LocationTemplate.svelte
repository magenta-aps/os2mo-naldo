<script lang="ts">
  export let orgUnit:
    | {
        name: string
        ancestors?: { name: string }[]
      }
    | undefined

  export let showCurrentName: boolean = true

  $: ancestors = orgUnit?.ancestors ?? []
  $: depth = ancestors.length // 0 = Root, 1 = Child, 2 = Grandchild...

  // LOGIC: If we have a Parent AND a Grandparent (Depth >= 2), split it.
  // Otherwise, try to fit it on one line.
  $: isDeep = depth >= 2
</script>

{#if orgUnit && depth > 0}
  {#if isDeep}
    <div class="text-xs text-base-content/80">
      {ancestors.at(-1)?.name}

      {#if depth >= 3}
        <span> / {ancestors.at(-2)?.name}</span>
      {/if}

      {#if depth >= 4}
        <span> / ..</span>
      {/if}
    </div>
  {/if}

  <div class="text-xs">
    <span class="text-base-content/80">
      {ancestors.at(0)?.name}
    </span>

    {#if showCurrentName}
      <span class="text-base-content/80">/</span>
      <span class="text-primary">{orgUnit.name}</span>
    {/if}
  </div>
{/if}
