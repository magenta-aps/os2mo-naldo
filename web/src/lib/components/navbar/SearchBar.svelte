<script lang="ts">
  import { _ } from "svelte-i18n"
  import { date } from "$lib/stores/date"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Search from "$lib/components/Search.svelte"
  import Icon from "@iconify/svelte"
  import personOutlineRounded from "@iconify/icons-material-symbols/person-outline-rounded"
  import homeWorkOutlineRounded from "@iconify/icons-material-symbols/home-work-outline-rounded"

  let orgChecked: boolean

  let selectedDate = $date
  let timeout: NodeJS.Timeout | undefined

  // Debounces the global date picker to improve performance while scrolling through dates
  // A lot of components react to changes in $date, such as the org_tree
  $: if (selectedDate) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      $date = selectedDate
    }, 500)
  }
</script>

<!-- Toggle -->
<div class="flex gap-2 items-center justify-center">
  <button
    on:click={() => {
      orgChecked = false
    }}
    class="text-base-100"
  >
    <Icon icon={personOutlineRounded} width="25" height="25" />
  </button>
  <input type="checkbox" class="toggle" bind:checked={orgChecked} />

  <button
    on:click={() => {
      orgChecked = true
    }}
    class="text-base-100 pr-2"
  >
    <Icon icon={homeWorkOutlineRounded} width="25" height="25" />
  </button>

  <!-- Search -->
  <div class="w-96 flex items-center justify-center">
    {#if orgChecked}
      <Search action="goto" type={"org-unit"} />
    {:else}
      <Search action="goto" type={"employee"} />
    {/if}
  </div>

  <!-- Datepicker -->
  <div>
    <DateInput
      bind:value={selectedDate}
      id="other-end-date"
      max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      noPadding={true}
    />
  </div>
</div>
