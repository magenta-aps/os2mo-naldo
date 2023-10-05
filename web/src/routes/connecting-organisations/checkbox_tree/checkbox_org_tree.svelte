<script lang="ts">
  import { graphQLClient } from "$lib/util/http"

  import { date } from "$lib/stores/date"
  import { gql } from "graphql-request"
  import { OrgTreeDocument } from "./query.generated"
  import CheckboxNode from "./checkboxNode.svelte"

  export let selectedOrg: { name: string; uuid?: any | null }
  export let startOrg: { name: string; uuid?: any | null } | null | undefined = {
    name: "",
    uuid: "",
  }
  selectedOrg = selectedOrg ?? startOrg // For flexibility when binding
  export let labelText = "Angiv overenhed"
  export let id = "checkbox-org-tree"
  export let allowMultipleSelection: boolean = false

  let orgTree: any[] = []

  gql`
    query OrgTree($from_date: DateTime!) {
      org_units(filter: { from_date: $from_date }) {
        objects {
          uuid
          objects {
            name
            uuid
            parent {
              name
              uuid
            }
            children {
              name
              uuid
            }
          }
        }
      }
    }
  `

  const fetchOrgTree = async () => {
    const data = await graphQLClient().request(OrgTreeDocument, { from_date: $date })
    if (data.org_units) {
      for (let org of data.org_units.objects) {
        if (org.objects[0].parent === null) {
          orgTree.push({
            uuid: org.uuid,
            name: org.objects[0].name,
            children: org.objects[0].children,
            fromDate: $date,
          })
        }
      }
    }
  }
</script>

<!-- TODO: fjern A11y ignore når relatedeUnit fungere som det skal, er pt tilføjet for ikke at have gule linjer over alt i koden -->
<!-- TODO: det ser måske lidt sjovt ud med spinning wheel ved siden af overskrifterne? -->
{#await fetchOrgTree()}
  <div class="form-control pb-4 flex flex-col">
    <label for={id} class="text-sm text-secondary pb-1 h-6 break-words flex items-end">
      {labelText}
      <span class="animate-spin rounded-full h-6 w-6 border-b-4 border-primary" />
    </label>
    <input disabled class="input input-bordered input-sm rounded w-full" />
  </div>
{:then data}
  <div class="form-control pb-4 flex flex-col">
    <label for={id} class="text-sm text-secondary pb-1 h-6 break-words flex items-end">
      {labelText}
    </label>

    <div class="max-w-full">
      <ul class="menu bg-white rounded border">
        {#each orgTree as child}
          <CheckboxNode {...child} bind:selectedOrg {allowMultipleSelection} />
        {/each}
      </ul>
    </div>
  </div>
{/await}
