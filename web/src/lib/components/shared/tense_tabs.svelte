<script lang="ts">
  import { tenses } from "$lib/stores/tenses"
</script>

<div class="tabs p-0 bg-base-100 border-primary border rounded my-5 w-fit">
  <div
    class="border-primary border-r text-slate-600 hover:text-secondary tab 
        {$tenses.future ? 'bg-accent text-primary' : ''}"
    on:click={() => {
      $tenses.future = !$tenses.future
    }}
  >
    Fremtid
  </div>
  <div
    class="tab text-slate-600 hover:text-secondary
        {$tenses.present ? 'bg-accent text-primary' : ''}"
    on:click={() => {
      $tenses.present = !$tenses.present
    }}
  >
    Nutid
  </div>
  <div
    class="border-primary border-l text-slate-600 hover:text-secondary tab 
        {$tenses.past ? 'bg-accent text-primary' : ''}"
    on:click={() => {
      $tenses.past = !$tenses.past
    }}
  >
    Fortid
  </div>
</div>
