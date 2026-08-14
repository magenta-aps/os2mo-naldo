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
  <ul>
    {#each managers as manager (manager.org_unit_uuid + manager.manager_type.uuid)}
      <li>
        <dt>{manager.manager_type.name}</dt>
        {#if manager.employee[0]}
          <dd>
            <a
              href={`${base}/orgviewer/person/${manager.employee[0].uuid}/${manager.org_unit_uuid}/${rootUuid}`}
            >
              {employeeDisplayName(manager.employee[0], showNickname)}
            </a>
          </dd>
        {:else}
          <dd>{capital($_("vacant"))}</dd>
        {/if}
      </li>
    {/each}
  </ul>
{/if}
