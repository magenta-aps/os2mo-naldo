<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { page } from "$app/stores"
  import PolicyFlow from "$lib/components/policies/PolicyFlow.svelte"
</script>

<title
  >{capital(
    $_("edit_item", { values: { item: $_("policies", { values: { n: 1 } }) } })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", { values: { item: $_("policies", { values: { n: 1 } }) } })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<PolicyFlow uuid={$page.params.policy} />
