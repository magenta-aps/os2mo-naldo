<script lang="ts">
  export let item: SearchResult
</script>

<div class="flex items-center cursor-pointer text-ellipsis">
  <div class="text-ellipsis">
    <p class="text-secondary">{item.name}</p>
  </div>
</div>
