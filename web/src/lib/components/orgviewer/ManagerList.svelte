<script lang="ts">
  import { base } from "$app/paths"
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import { employeeDisplayName, type OrgViewerManager } from "./organisation"

  export let managers: OrgViewerManager[]
  export let rootUuid: string
  export let showNickname: boolean
</script>

{#if managers.length}
  <ul class="divide-y divide-base-300">
    {#each managers as manager (manager.org_unit_uuid + manager.manager_type.uuid)}
      <li class="flex items-center justify-between gap-2 py-1.5">
        <span class="text-sm text-base-content/60">{manager.manager_type.name}</span>
        {#if manager.employee[0]}
          <a
            class="font-medium"
            href={`${base}/orgviewer/person/${manager.employee[0].uuid}/${manager.org_unit_uuid}/${rootUuid}`}
          >
            {employeeDisplayName(manager.employee[0], showNickname)}
          </a>
        {:else}
          <span class="text-base-content/60 italic">{capital($_("vacant"))}</span>
        {/if}
      </li>
    {/each}
  </ul>
{/if}
