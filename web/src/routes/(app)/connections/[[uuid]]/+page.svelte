<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { fetchParentTree } from "$lib/http/parentTree"
  import Node from "./node.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { error, success } from "$lib/stores/alert"
  import { date } from "$lib/stores/date"
  import { gql } from "graphql-request"
  import {
    OrgUnitDocument,
    OrgUnitsWithChildrenDocument,
    UpdateRelatedUnitsDocument,
    RelatedUnitsDocument,
  } from "./query.generated"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { page } from "$app/stores"

  gql`
    query OrgUnit($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate, to_date: null }) {
        objects {
          validities {
            name
            uuid
          }
        }
      }
    }

    query OrgUnitsWithChildren($fromDate: DateTime) {
      org_units(filter: { parents: null, from_date: $fromDate }) {
        objects {
          validities {
            name
            uuid
            user_key
            has_children(filter: { from_date: $fromDate })
          }
        }
      }
    }

    query RelatedUnits($org_unit: [UUID!], $fromDate: DateTime) {
      related_units(filter: { org_unit: { uuids: $org_unit }, from_date: $fromDate }) {
        objects {
          validities {
            org_units {
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
    }

    mutation UpdateRelatedUnits($input: RelatedUnitsUpdateInput!) {
      related_units_update(input: $input) {
        uuid
      }
    }
  `

  let startDate: string = $date

  const fromDate = field("from", "", [required()])
  const svelteForm = form(fromDate)

  let originOrgUnit: { uuid: string; name: string } | undefined

  $: selectedOriginOrg = originOrgUnit?.uuid ?? null

  const loadOrgTree = async (fromDate: string) => {
    const res = await graphQLClient().request(OrgUnitsWithChildrenDocument, {
      fromDate: fromDate,
    })
    return res.org_units.objects
      .map((org) => ({ ...org.validities[0], fromDate }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  // The root tree depends only on `fromDate`, so cache by date: switching origin
  // (same date) reuses the in-flight/resolved tree instead of refetching it.
  const orgTreeCache = new Map<string, ReturnType<typeof loadOrgTree>>()
  const fetchOrgTree = (fromDate: string) => {
    let cached = orgTreeCache.get(fromDate)
    if (!cached) {
      cached = loadOrgTree(fromDate)
      orgTreeCache.set(fromDate, cached)
    }
    return cached
  }

  // Resolves to everything the destination column needs: the root tree, the
  // UUIDs that should be checkbox-checked, and the UUIDs whose subtrees
  // should be auto-expanded (= every ancestor of every destination).
  const buildState = async (
    org: { uuid: string; name: string } | undefined,
    fromDate: string
  ) => {
    const tree = await fetchOrgTree(fromDate)
    if (!org) return { tree, destinations: [] as string[], openSet: new Set<string>() }
    const res = await graphQLClient().request(RelatedUnitsDocument, {
      fromDate: fromDate,
      org_unit: org.uuid,
    })
    const destinations = res.related_units.objects.map((r) => {
      const [a, b] = r.validities[0].org_units
      return a.uuid === org.uuid ? b.uuid : a.uuid
    })
    const ancestors = await Promise.all(
      destinations.map((uuid) =>
        fetchParentTree(uuid, fromDate).then((p) => p.map((n) => n.uuid))
      )
    )
    return { tree, destinations, openSet: new Set<string>(ancestors.flat()) }
  }

  // Optional prefill from `/connections/<uuid>`. buildState below waits on
  // this so we don't fetch a root tree just to throw it away once the origin
  // loads.
  const prefillOrigin = (async () => {
    if (!$page.params.uuid) return
    const res = await graphQLClient().request(OrgUnitDocument, {
      uuid: $page.params.uuid,
      // null → resolve the unit regardless of whether it's valid at the start
      // date, so arriving from "manage connections" never opens contextless.
      fromDate: null,
    })
    const orgUnit = res.org_units.objects[0]?.validities[0]
    if (orgUnit) {
      originOrgUnit = { uuid: orgUnit.uuid, name: orgUnit.name }
    }
  })()

  // The promise drives the {#await} block. `lastState` memoizes the previous
  // resolved value so it can stay on screen while a refetch is in flight.
  let lastState: Awaited<ReturnType<typeof buildState>> | undefined
  let stateRequestId = 0
  $: statePromise = prefillOrigin.then(() => buildState(originOrgUnit, startDate))
  $: {
    // Guard against out-of-order resolution: a slow earlier request must not
    // overwrite a newer one. Only the most recently issued request may write
    // lastState. Surface failures via the error toast instead of hanging.
    const requestId = ++stateRequestId
    statePromise
      .then((state) => {
        if (requestId === stateRequestId) lastState = state
      })
      .catch((err) => {
        if (requestId === stateRequestId) $error = { message: err }
      })
  }

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateRelatedUnitsDocument, {
              input: result.data,
            })
            $success = {
              message: capital($_("connection_success")),
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<title>{$_("navigation.connections")} | OS2mo</title>

<div class="flex px-6 pt-6 pb-4 align-center">
  <h3 class="flex-1">{$_("navigation.connections")}</h3>
</div>

<div class="p-0 m-0 mb-4 w-full divider" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="rounded-sm min-w-fit bg-base-200">
    <div class="p-8">
      <div class="flex flex-row gap-6 w-1/2">
        <DateInput
          bind:value={startDate}
          bind:validationValue={$fromDate.value}
          errors={$fromDate.errors}
          title={capital($_("date.start_date"))}
          id="from"
          required={true}
        />
        <div class="basis-1/2" />
      </div>
      <div class="flex flex-col gap-6 w-full sm:flex-row">
        <div class="w-1/2">
          <Search
            type="org-unit"
            id="origin"
            at={startDate}
            bind:value={originOrgUnit}
            startValue={originOrgUnit}
            required={true}
          />
        </div>
        <div class="w-1/2 relative">
          {#if lastState}
            <div class="overflow-y-auto max-h-[60vh]">
              <ul class="py-4 w-full menu bg-base-100 text-base-content">
                {#each lastState.tree as child}
                  <Node
                    {...child}
                    openSet={lastState.openSet}
                    selectedDestinationOrgs={lastState.destinations}
                    {selectedOriginOrg}
                  />
                {/each}
              </ul>
            </div>
          {/if}
          {#await statePromise}
            <div
              class="flex justify-center items-center {lastState
                ? 'absolute inset-0 bg-base-100/50 pointer-events-none'
                : ''}"
            >
              <span class="loading loading-spinner" />
            </div>
          {/await}
        </div>
      </div>
    </div>
  </div>

  <div class="flex py-6 gap-4">
    <Button type="submit" title={capital($_("save"))} disabled={!selectedOriginOrg} />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      on:click={() => history.back()}
    />
  </div>
</form>
