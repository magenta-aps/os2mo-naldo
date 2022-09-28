<script lang="ts">
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"

  interface Query {
    data: Data | null
    errors?: Error[]
  }

  interface Data {
    org_units: OrganisationUnitResponse[]
  }

  interface OrganisationUnitResponse {
    objects: OrganisationUnitElement[]
  }

  interface OrganisationUnitElement {
    parent: ParentOrganisationUnit | null
  }

  interface ParentOrganisationUnit {
    name: string
    uuid: string
  }

  interface Error {
    message: string
  }

  export let currentOrg: string

  const query = (uuid: string): string => {
    return `
      query {
        org_units(uuids: "${uuid}") {
        objects {
          parent {
            name
            uuid
          }
        }
      }
    }`
  }

  const fetchParent = async (
    uuid: string
  ): Promise<ParentOrganisationUnit | undefined | null> => {
    const res = await fetchGraph(query(uuid))
    const json: Query = await res.json()

    return json.data?.org_units[0].objects[0].parent
  }

  const fetchParentTree = async (uuid: string): Promise<ParentOrganisationUnit[]> => {
    const parents: ParentOrganisationUnit[] = []
    let nextUuid = uuid

    while (true) {
      const parent = await fetchParent(nextUuid)

      if (!parent) break

      parents.push(parent)
      nextUuid = parent.uuid
    }

    return parents
  }
</script>

{#await fetchParentTree($page.params.uuid)}
  <div class="text-secondary py-5">Loading breadcrumbs...</div>
{:then parents}
  <div class="text-secondary py-5 breadcrumbs">
    <ul>
      {#each parents.reverse() as parent}
        <li>
          <a href="{base}/organisation/{parent.uuid}">
            {parent.name}
          </a>
        </li>
      {/each}
      <li>
        {currentOrg}
      </li>
    </ul>
  </div>
{/await}
