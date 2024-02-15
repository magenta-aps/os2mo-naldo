<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import CheckboxNode from "./checkbox_node.svelte"

  export let title = `${capital($_("specify"))} ${$_("unit", { values: { n: 1 } })}`
  export let id = "checkbox_org_tree"
  export let allowMultipleSelection: boolean = false
  export let orgTree: any[] = []
  export let selectedOriginOrg: { uuid: string; name: string } | null = null
  export let selectedDestinationsOrgs: { uuid: string; name: string }[] = []
</script>

<div class="form-control pb-4">
  <label for={id} class="text-sm text-secondary pb-1 h-6 break-words flex items-end">
    {title}
  </label>
  <div class="max-w-full">
    <ul class="menu bg-white rounded border">
      {#each orgTree as child}
        <CheckboxNode
          {...child}
          {allowMultipleSelection}
          bind:orgTree
          bind:selectedDestinationsOrgs
          bind:selectedOriginOrg
        />
      {/each}
    </ul>
  </div>
</div>
