<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/http/client"
  import { fetchParentTree } from "$lib/http/parentTree"
  import Node from "$lib/components/org/tree/Node.svelte"
  import type { FacetValidities } from "$lib/utils/classes"
  import { success } from "$lib/stores/alert"
  import { date } from "$lib/stores/date"
  import { globalNavigation } from "$lib/stores/navigation"
  import { orgUnitHierarchyStore } from "$lib/stores/hierarchy"
  import { gql } from "graphql-request"
  import {
    OrgUnitsWithChildrenDocument,
    type OrgUnitsWithChildrenQuery,
    type OrgUnitsWithFilteredChildrenQuery,
    OrgUnitsWithFilteredChildrenDocument,
  } from "./query.generated"
  import { type OrgTreeItem } from "$lib/components/org/tree/orgTree"
  import { getClasses } from "$lib/http/getClasses"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { onMount } from "svelte"

  gql`
    query OrgUnitsWithChildren($fromDate: DateTime) {
      org_units(filter: { parents: null, from_date: $fromDate }) {
        objects {
          validities {
            name
            user_key
            uuid
            has_children(filter: { from_date: $fromDate })
          }
        }
      }
    }

    query OrgUnitsWithFilteredChildren(
      $fromDate: DateTime
      $orgUnitHierarchies: [UUID!]
    ) {
      org_units(
        filter: {
          parents: null
          descendant: {
            from_date: $fromDate
            hierarchy: { uuids: $orgUnitHierarchies }
          }
        }
      ) {
        objects {
          validities {
            name
            user_key
            uuid
            has_children(
              filter: {
                descendant: {
                  from_date: $fromDate
                  hierarchy: { uuids: $orgUnitHierarchies }
                }
              }
            )
          }
        }
      }
    }
  `

  const fetchOrgTree = async (
    fromDate: string,
    childUuid?: string | null,
    orgUnitHierarchyUuid?: string | null
  ) => {
    // Breadcrumbs
    let res: OrgUnitsWithChildrenQuery | OrgUnitsWithFilteredChildrenQuery

    if (orgUnitHierarchyUuid) {
      res = await graphQLClient().request(OrgUnitsWithFilteredChildrenDocument, {
        fromDate: fromDate,
        orgUnitHierarchies: orgUnitHierarchyUuid,
      })
    } else {
      res = await graphQLClient().request(OrgUnitsWithChildrenDocument, {
        fromDate: fromDate,
      })
    }

    const orgTree = []
    const uuid = childUuid ? childUuid : $page.params.uuid

    // Will return an empty list of "breadcrumbs" if the route isn't under organisation
    // or it doesn't have UUID
    const breadcrumbs =
      $page.url.pathname?.startsWith("/organisation") && uuid
        ? (await fetchParentTree(uuid, fromDate)).map((e) => e.uuid).reverse()
        : []

    for (let org of res.org_units.objects) {
      orgTree.push({
        ...org.validities[0],
        orgUnitHierarchyUuid: orgUnitHierarchyUuid,
        breadcrumbs: breadcrumbs,
        fromDate: fromDate,
      })
    }
    return orgTree
  }

  const brutto = {
    uuid: null,
    name: capital($_("entire_organisation")),
    user_key: null,
  }

  let hierarchies: FacetValidities[]
  let selectedHierarchy = brutto
  let hierarchyClasses: any = []
  let refreshableOrgTree: Promise<OrgTreeItem[]>

  onMount(async () => {
    hierarchies = await getClasses({
      currentDate: $date,
      orgUuid: null,
      facetUserKeys: ["org_unit_hierarchy"],
    })
    hierarchyClasses =
      filterClassesByFacetUserKey(hierarchies, "org_unit_hierarchy")?.flat() ?? []

    const storedUuid = $orgUnitHierarchyStore
    selectedHierarchy =
      [brutto, ...hierarchyClasses].find((h) => h.uuid === storedUuid) ?? brutto

    orgUnitHierarchyStore.set(selectedHierarchy.uuid)
    refreshableOrgTree = fetchOrgTree($date, null, $orgUnitHierarchyStore)
  })

  $: if ($success?.type === "organisation") {
    refreshableOrgTree = fetchOrgTree($date, $success.uuid, selectedHierarchy.uuid)
  }

  $: if ($globalNavigation || $date) {
    refreshableOrgTree = fetchOrgTree($date, $globalNavigation, selectedHierarchy.uuid)
  }
</script>

{#if hierarchyClasses && hierarchyClasses.length}
  <Select
    id="org-unit-hierarchy"
    bind:value={selectedHierarchy}
    startValue={brutto}
    iterable={[brutto, ...hierarchyClasses]}
    on:change={() => orgUnitHierarchyStore.set(selectedHierarchy?.uuid)}
  />
{/if}

{#key refreshableOrgTree}
  {#await refreshableOrgTree}
    <div role="status" class="max-w-sm animate-pulse">
      <div class="mb-2.5 h-10 rounded bg-base-100 max-w-4 dark:bg-accent" />
      <span class="sr-only">{capital($_("loading"))}...</span>
    </div>
  {:then orgTree}
    {#each orgTree.sort( (a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1) ) as child}
      <Node {...child} />
    {/each}
  {/await}
{/key}
