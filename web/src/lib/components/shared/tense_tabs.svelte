<script lang="ts">
  import { _ } from "svelte-i18n"
  import { tenses } from "$lib/stores/tenses"
</script>

<div class="tabs p-0 bg-base-100 border-primary border rounded my-5 w-fit">
  <button
    class="border-primary border-r text-slate-600 hover:text-secondary tab
        {$tenses.future ? 'bg-accent text-primary' : ''}"
    on:click={() => {
      $tenses.future = !$tenses.future
    }}
  >
    {$_("future")}
  </button>
  <button
    class="tab text-slate-600 hover:text-secondary
        {$tenses.present ? 'bg-accent text-primary' : ''}"
    on:click={() => {
      $tenses.present = !$tenses.present
    }}
  >
    {$_("present")}
  </button>
  <button
    class="border-primary border-l text-slate-600 hover:text-secondary tab
        {$tenses.past ? 'bg-accent text-primary' : ''}"
    on:click={() => {
      $tenses.past = !$tenses.past
    }}
  >
    {$_("past")}
  </button>
</div>
