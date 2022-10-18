<script lang="ts">
  import { tenses } from "$lib/stores/tenses"
</script>

<div class="tabs tabs-boxed p-0 bg-base-100 border-primary border-2 my-5 w-fit">
  <div
    class="border-primary border-r-2 text-slate-600 hover:text-secondary tab 
        {$tenses.past ? 'bg-accent rounded-l-md' : ''}"
    on:click={() => {
      $tenses.past = !$tenses.past
    }}
  >
    Fortid
  </div>
  <div
    class="tab text-slate-600 hover:text-secondary 
        {$tenses.present ? 'bg-accent' : ''}"
    on:click={() => {
      $tenses.present = !$tenses.present
    }}
  >
    Nutid
  </div>
  <div
    class="border-primary border-l-2 text-slate-600 hover:text-secondary tab 
        {$tenses.future ? 'bg-accent rounded-r-md' : ''}"
    on:click={() => {
      $tenses.future = !$tenses.future
    }}
  >
    Datid
  </div>
</div>
