<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
</script>

<HeadTitle type="admin" />

<div class="flex px-12 pt-6">
  <main class="flex-1">
    <h1 class="pb-4">
      {capital($_("policies", { values: { n: 2 } }))}
    </h1>
  </main>
</div>
