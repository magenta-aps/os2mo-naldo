<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { fetchParentTree } from "$lib/util/parent_tree.js"
  import Node from "$lib/components/org/tree/Node.svelte"
  import { success } from "$lib/stores/alert"
  import { date } from "$lib/stores/date"
  import { globalNavigation } from "$lib/stores/navigation"
  import { gql } from "graphql-request"
  import {
    OrgUnitsWithChildrenDocument,
    OrgUnitHierarchiesDocument,
    type OrgUnitsWithChildrenQuery,
    type OrgUnitsWithFilteredChildrenQuery,
    OrgUnitsWithFilteredChildrenDocument,
  } from "./query.generated"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Select from "$lib/components/forms/shared/Select.svelte"

  const brutto = {
    uuid: null,
    name: capital($_("entire_organisation")),
    user_key: null,
  }
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
    orgUnitHierarchyUuid?: string | null
  ) => {
    gql`
      query OrgUnitsWithChildren($fromDate: DateTime) {
        org_units(filter: { parents: null, from_date: $fromDate }) {
          objects {
            validities {
              name
              uuid
              child_count(filter: { from_date: $fromDate })
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
            subtree: { from_date: $fromDate, hierarchy: { uuids: $orgUnitHierarchies } }
          }
        ) {
          objects {
            validities {
              name
              uuid
              child_count(
                filter: {
                  subtree: {
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
      $page.route.id?.startsWith("/organisation") && uuid
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

  let refreshableOrgTree = fetchOrgTree($date, null, orgUnitHierachy?.uuid)

  // TODO: Replace with subscriptions when implmented
  $: if ($success.type === "organisation") {
    refreshableOrgTree = fetchOrgTree($date, $success.uuid)
  }

  // Triggered when using the global navigation to find an organisation
  $: if ($globalNavigation || $date) {
    refreshableOrgTree = fetchOrgTree($date, $globalNavigation)
  }
</script>

{#await graphQLClient().request(OrgUnitHierarchiesDocument)}
  <div role="status" class="max-w-sm animate-pulse">
    <div class="mb-2.5 h-10 rounded bg-base-100 max-w-4 dark:bg-accent" />
    <span class="sr-only">{capital($_("loading"))}...</span>
  </div>
{:then data}
  {#if data.facets.objects.length && data.facets.objects[0].objects[0].classes.length}
    {@const facets = data.facets.objects}
    <!-- Do this to avoid flat returning undefined in iterable, since `iterable: Value` -->
    {@const hierarchies = getClassesByFacetUserKey(
      facets,
      "org_unit_hierarchy"
    )?.flat()}
    <Select
      id="org-unit-hierarchy"
      bind:value={orgUnitHierachy}
      startValue={brutto}
      iterable={[brutto, ...(hierarchies ? hierarchies : [])]}
      on:change={() =>
        (refreshableOrgTree = fetchOrgTree($date, null, orgUnitHierachy?.uuid))}
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
{/await}
