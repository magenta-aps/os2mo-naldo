<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { tenses } from "$lib/stores/tenses"
</script>

<div class="tabs tabs-sm bg-base-100 border-primary border rounded-sm my-5 w-fit">
  <button
    class="border-primary border-r rounded-l-sm text-base-content/80 tab
        {$tenses.future ? 'bg-accent text-primary' : ''}"
    on:click={() => {
      $tenses.future = !$tenses.future
    }}
  >
    {capital($_("future"))}
  </button>
  <button
    class="tab text-base-content/80
        {$tenses.present ? 'bg-accent text-primary' : ''}"
    on:click={() => {
      $tenses.present = !$tenses.present
    }}
  >
    {capital($_("present"))}
  </button>
  <button
    class="border-primary border-l rounded-r-sm text-base-content/80 tab
        {$tenses.past ? 'bg-accent text-primary' : ''}"
    on:click={() => {
      $tenses.past = !$tenses.past
    }}
  >
    {capital($_("past"))}
  </button>
</div>
