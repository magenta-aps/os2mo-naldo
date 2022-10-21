<script lang="ts">
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { env } from "$env/dynamic/public"
  import Icon from "$lib/components/icon.svelte"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import type { OrganisationUnitElement } from "../../../../routes/organisation/[uuid]/data"

  export let orgUnits: OrganisationUnitElement[]
</script>

<DetailTable
  headers={env.PUBLIC_ENABLE_UNIT_TERMINATE === "true"
    ? ["Enhed", "Enhedstype", "Enhedsniveau", "Overenhed", "Dato", "", ""]
    : ["Enhed", "Enhedstype", "Enhedsniveau", "Overenhed", "Dato", ""]}
>
  {#each orgUnits as data}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">{data.name}</td>
      <td class="p-4">{data.unit_type ? data.unit_type.name : "Ikke sat"}</td>
      <td class="p-4">{data.org_unit_level ? data.org_unit_level.name : "Ikke sat"}</td>
      {#if data.parent}
        <a href="{base}/organisation/{data.parent.uuid}">
          <td class="p-4">{data.parent.name}</td>
        </a>
      {:else}
        <td class="p-4">Ingen overenhed</td>
      {/if}
      <ValidityTableCell validity={data.validity} />
      <td>
        <a href="{base}/organisation/{$page.params.uuid}/edit/unit">
          <Icon type="pen" />
        </a>
      </td>

      {#if env.PUBLIC_ENABLE_UNIT_TERMINATE === "true"}
        <td>
          <a
            href="{base}/organisation/{$page.params.uuid}/terminate/unit"
            class="hover:slate-300"
          >
            <Icon type="xmark" size="30" />
          </a>
        </td>
      {/if}
    </tr>
  {/each}
</DetailTable>
