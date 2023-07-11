<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { KleDocument } from "./query.generated"
  import { gql } from "graphql-request"

  export let uuid: string
  export let tense: string

  gql`
    query Kle($uuid: [UUID!]) {
      kles(org_units: $uuid) {
        objects {
          uuid
          kle_number {
            name
            uuid
          }
          kle_aspects {
            name
            uuid
          }
          validity {
            from
            to
          }
        }
      }
    }
  `
</script>

<DetailTable headers={["KLE aspekt", "KLE nummer", "Dato", "", ""]}>
  {#await graphQLClient().request(KleDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const kles = data.kles}
    {#each kles as kle}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">{kle.objects[0].kle_aspects[0].name}</td>
        <td class="p-4">{kle.objects[0].kle_number.name}</td>
        <ValidityTableCell validity={kle.objects[0].validity} />
        <td>
          <a href="{base}/organisation/{$page.params.uuid}/edit/kle/{kle.objects[0].uuid}">
            <Icon type="pen" />
          </a>
        </td>
        <td>
          
          <a href="{base}/organisation/{$page.params.uuid}/terminate/kle/{kle.objects[0].uuid}">
            <Icon type="xmark" size="30" />
          </a>
        </td>
      </tr>
    {/each}
  {/await}
</DetailTable>
