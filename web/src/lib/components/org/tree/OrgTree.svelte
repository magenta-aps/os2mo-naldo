<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/http/client"
  import { fetchParentTree } from "$lib/http/parentTree"
  import Node from "$lib/components/org/tree/Node.svelte"
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
    orgUnitHierarchyUuid?: string | null,
    signal?: AbortSignal
  ) => {
    // Breadcrumbs
    let res: OrgUnitsWithChildrenQuery | OrgUnitsWithFilteredChildrenQuery

    if (orgUnitHierarchyUuid) {
      res = await graphQLClient(signal).request(OrgUnitsWithFilteredChildrenDocument, {
        fromDate: fromDate,
        orgUnitHierarchies: orgUnitHierarchyUuid,
      })
    } else {
      res = await graphQLClient(signal).request(OrgUnitsWithChildrenDocument, {
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

  // --- STATE ---
  let hierarchyClasses: any[] = []
  let selectedHierarchy = brutto
  let refreshableOrgTree: Promise<OrgTreeItem[]> = Promise.resolve([]) // Start empty

  // --- INTERNAL TRACKING ---
  let cachedDate: string | null = null
  let lastFetchSignature = ""
  let abortController: AbortController

  // Only runs when Date changes.
  $: if ($date && $date !== cachedDate) {
    ;(async () => {
      try {
        const res = await getClasses({
          currentDate: $date,
          orgUuid: null,
          facetUserKeys: ["org_unit_hierarchy"],
        })
        hierarchyClasses =
          filterClassesByFacetUserKey(res, "org_unit_hierarchy")?.flat() ?? []
        cachedDate = $date
      } catch (e) {
        console.error(e)
      }
    })()
  }

  // We calculate the target UUID here.
  $: calculatedTarget =
    $success?.type === "organisation" && $success.uuid
      ? $success.uuid
      : $globalNavigation

  // We calculate the hierarchy object based on the store.
  // If the store is invalid, this safely falls back to 'brutto'.
  // We DO NOT write to the store here (prevents loops).
  $: validHierarchy =
    [brutto, ...hierarchyClasses].find((h) => h.uuid === $orgUnitHierarchyStore) ??
    brutto

  // Visual Sync: Update the UI dropdown to match our validated logic
  $: if (selectedHierarchy?.uuid !== validHierarchy.uuid) {
    selectedHierarchy = validHierarchy
  }

  // This is the ONLY place that fetches the tree.
  // It watches our "Cleaned" variables: 'calculatedTarget' and 'validHierarchy'.
  $: {
    // Create a signature of the "Effective" request
    const signature = JSON.stringify({
      d: $date,
      t: calculatedTarget,
      h: validHierarchy.uuid,
    })

    // This is the guard, to avoid multiple fetches.
    if (signature !== lastFetchSignature && $date) {
      lastFetchSignature = signature

      // Cancel previous
      if (abortController) abortController.abort()
      abortController = new AbortController()

      // Fetch
      refreshableOrgTree = fetchOrgTree(
        $date,
        calculatedTarget,
        validHierarchy.uuid,
        abortController.signal
      )
    }
  }

  const handleUserChange = (e: CustomEvent) => {
    const newUuid = e.detail?.uuid ?? null

    // LOOP PROTECTION: Only update store if it's ACTUALLY different
    if ($orgUnitHierarchyStore !== newUuid) {
      orgUnitHierarchyStore.set(newUuid)
    }
  }
</script>

{#if hierarchyClasses.length}
  <Select
    id="org-unit-hierarchy"
    value={selectedHierarchy}
    iterable={[brutto, ...hierarchyClasses]}
    on:change={handleUserChange}
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
