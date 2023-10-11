<script lang="ts">
  import { graphQLClient } from "$lib/util/http"
  import { date } from "$lib/stores/date"
  import { gql } from "graphql-request"
  import { RelatedeUnitsOrgTreeDocument } from "./query.generated"
  import CheckboxNode from "./checkboxNode.svelte"

  export let labelText = "Vælg ebhed"
  export let id = "checkbox-org-tree"
  export let allowMultipleSelection: boolean = false

  let orgTree: any[] = []

  gql`
    query RelatedeUnitsOrgTree($from_date: DateTime!) {
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
    const data = await graphQLClient().request(RelatedeUnitsOrgTreeDocument, {
      from_date: $date,
    })
    if (data.org_units) {
      for (let org of data.org_units.objects) {
        if (org.objects[0].parent === null) {
          const sortedChildren = org.objects[0].children.sort((a, b) =>
            a.name.localeCompare(b.name)
          )
          orgTree.push({
            uuid: org.uuid,
            name: org.objects[0].name,
            children: sortedChildren,
            fromDate: $date,
          })
        }
      }
    }
  }
</script>

<!-- TODO: det ser måske lidt sjovt ud med spinning wheel ved siden af begge overskrifter? -->
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
          <CheckboxNode {...child} {allowMultipleSelection} />
        {/each}
      </ul>
    </div>
  </div>
{/await}
