<script lang="ts">
  export let item: { titel: string }
</script>

<div class="flex items-center cursor-pointer text-ellipsis">
  <div class="text-ellipsis">
    <div class="inline-block text-base-content">{item.titel}</div>
  </div>
</div>
