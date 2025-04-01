<script lang="ts">
  export let item: CprLookupResponse
  export let slot: string
</script>

<div class="flex items-center cursor-pointer text-ellipsis">
  <div class="text-ellipsis">
    <div class="inline-block text-secondary">
      {slot === "item" ? item.name : item.cpr_no}
    </div>
  </div>
</div>
