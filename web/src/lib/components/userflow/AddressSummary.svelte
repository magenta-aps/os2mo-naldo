<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { addressInfo } from "$lib/stores/addressInfoStore"
</script>

<div>
  <h3 class="text-primary">{capital($_("address", { values: { n: 2 } }))}</h3>
  {#each $addressInfo as address, index}
    {#if address.validated === true}
      <div class="grid gap-1 pb-2 text-secondary">
        <h4>
          {capital($_("address", { values: { n: 1 } }))}
          {index + 1}
        </h4>
        <div class="pb-1">
          <div class="grid grid-cols-2">
            <span>{capital($_("date.start_date"))}:</span>
            <span>{address.fromDate}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("date.end_date"))}:</span>
            <span>{address.toDate}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("visibility"))}:</span>
            <span>{address.visibility?.name ? address.visibility.name : ""}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("description"))}:</span>
            <span>{address.userkey ? address.userkey : ""}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>
              {capital($_("address_type", { values: { n: 1 } }))}:
            </span>
            <span>{address.addressType?.name}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_(address.addressType.name))}:</span>
            <span
              >{!!address.addressValue.name
                ? address.addressValue.name
                : address.addressValue.value}</span
            >
          </div>
        </div>
      </div>
    {/if}
  {/each}
</div>
