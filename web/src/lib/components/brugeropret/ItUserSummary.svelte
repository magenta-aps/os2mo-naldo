<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
</script>

<div>
  <h2 class="pb-2">{capital($_("ituser", { values: { n: 1 } }))}</h2>
  <dl class="grid gap-1">
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.start_date"))}:</dt>
      <dd>{$ituserInfo.fromDate}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("date.end_date"))}:</dt>
      <dd>{$ituserInfo.toDate}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("itsystem"))}:</dt>
      <dd>{$ituserInfo.itSystem.name}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("account_name"))}:</dt>
      <dd>{$ituserInfo.userkey}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("primary"))}:</dt>
      <dd>{$ituserInfo.primary ? $ituserInfo.primary : ""}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("notes"))}:</dt>
      <dd>{$ituserInfo.notes ? $ituserInfo.notes : ""}</dd>
    </div>
  </dl>
</div>
