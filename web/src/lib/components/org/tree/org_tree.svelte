<script lang="ts">
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { fetchParentTree } from "$lib/util/parent_tree.js"
  import Node from "$lib/components/org/tree/node.svelte"
  import { success } from "$lib/stores/alert"
  import { date } from "$lib/stores/date"
  import { globalNavigation } from "$lib/stores/navigation"
  import { gql } from "graphql-request"
  import {
    OrgUnitsWithChildrenDocument,
    OrgUnitHierarchiesDocument,
  } from "./query.generated"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Select from "$lib/components/forms/shared/select.svelte"

  const brutto = { uuid: null, name: "Bruttoorganisation", user_key: null }
  let orgUnitHierachy = brutto

  gql`
    query OrgUnitHierarchies {
      facets(filter: { user_keys: "org_unit_hierarchy" }) {
        objects {
          objects {
            user_key
            uuid
            classes {
              name
              user_key
              uuid
            }
          }
        }
      }
    }
  `

  // First load from index
  const fetchOrgTree = async (
    fromDate: string,
    childUuid?: string | null,
    orgUnitHierachyUuid?: string | null
  ) => {
    gql`
      query OrgUnitsWithChildren($fromDate: DateTime, $orgUnitHierarchies: [UUID!]) {
        org_units(
          filter: {
            parents: null
            from_date: $fromDate
            hierarchies: $orgUnitHierarchies
          }
        ) {
          objects {
            objects {
              name
              uuid
              children {
                name
                uuid
              }
            }
          }
        }
      }
    `

    // Breadcrumbs
    const res = await graphQLClient().request(OrgUnitsWithChildrenDocument, {
      fromDate: fromDate,
      orgUnitHierarchies: orgUnitHierachyUuid,
    })

    const orgTree = []
    const uuid = childUuid ? childUuid : $page.params.uuid

    // Will return an empty list of "breadcrumbs" if the route isn't under organisation
    // or it doesn't have UUID
    const breadcrumbs =
      $page.route.id?.startsWith("/organisation") && uuid
        ? (await fetchParentTree(uuid, fromDate)).map((e) => e.uuid).reverse()
        : []

    for (let org of res.org_units.objects) {
      orgTree.push({
        uuid: org.objects[0].uuid,
        name: org.objects[0].name,
        children: org.objects[0].children,
        breadcrumbs: breadcrumbs,
        fromDate: fromDate,
      })
    }
    return orgTree
  }

  let refreshableOrgTree = fetchOrgTree($date, null, orgUnitHierachy?.uuid)

  // TODO: Replace with subscriptions when implmented
  $: if ($success.type === "organisation") {
    refreshableOrgTree = fetchOrgTree($date, $success.uuid)
  }

  // Triggered when using the global navigation to find an organisation
  $: if ($globalNavigation) {
    refreshableOrgTree = fetchOrgTree($date, $globalNavigation.uuid)
  }
</script>

{#await graphQLClient().request(OrgUnitHierarchiesDocument) then data}
  {#if data.facets.objects.length && data.facets.objects[0].objects[0].classes.length}
    {@const facets = data.facets.objects}
    <Select
      id="org-unit-hierarchy"
      bind:value={orgUnitHierachy}
      startValue={brutto}
      iterable={getClassesByFacetUserKey(facets, "org_unit_hierarchy")}
      on:change={() =>
        (refreshableOrgTree = fetchOrgTree($date, null, orgUnitHierachy?.uuid))}
    />
  {/if}
  {#key refreshableOrgTree}
    {#await refreshableOrgTree}
      <div role="status" class="max-w-sm animate-pulse">
        <div class="h-10 bg-base-100 rounded dark:bg-accent max-w-4 mb-2.5" />
        <span class="sr-only">Loading...</span>
      </div>
    {:then orgTree}
      {#each orgTree.sort( (a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1) ) as child}
        <Node {...child} />
      {/each}
    {/await}
  {/key}
{/await}
