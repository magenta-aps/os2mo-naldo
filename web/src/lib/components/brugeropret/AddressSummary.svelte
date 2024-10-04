<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { addressInfo } from "$lib/stores/addressInfoStore"
</script>

<div>
  <h2 class="pb-2">{capital($_("address", { values: { n: 1 } }))}</h2>
  <dl class="grid gap-1">
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.start_date"))}:</dt>
      <dd>{$addressInfo.fromDate}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.end_date"))}:</dt>
      <dd>{$addressInfo.toDate}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("visibility"))}:</dt>
      <dd>{$addressInfo.visibility?.name ? $addressInfo.visibility.name : ""}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("description"))}:</dt>
      <dd>{$addressInfo.userkey ? $addressInfo.userkey : ""}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("address_type"))}:</dt>
      <dd>{$addressInfo.addressType.name ? $addressInfo.addressType.name : ""}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_($addressInfo.addressType.name))}:</dt>
      <dd>{$addressInfo.addressValue}</dd>
      {console.log($addressInfo.addressValue)}
    </div>
  </dl>
</div>
