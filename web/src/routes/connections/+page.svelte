<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { fetchParentTree } from "$lib/http/parentTree"
  import Node from "./node.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "../connections/$types"
  import { error, success } from "$lib/stores/alert"
  import { date } from "$lib/stores/date"
  import { gql } from "graphql-request"
  import {
    OrgUnitsWithChildrenDocument,
    UpdateRelatedUnitsDocument,
    RelatedUnitsDocument,
  } from "./query.generated"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  const fromDate = field("from", "", [required()])
  const svelteForm = form(fromDate)

  let selectedOriginOrg: string | null = null
  let selectedDestinationOrgs: string[] = []

  gql`
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
        validities {
          org_units {
            name
          }
        }
      }
    }
  `
  const fetchOrgTree = async (fromDate: string, breadcrumbs?: string[][]) => {
    const res = await graphQLClient().request(OrgUnitsWithChildrenDocument, {
      fromDate: fromDate,
    })

    const orgTree = []

    for (let org of res.org_units.objects) {
      orgTree.push({
        ...org.validities[0],
        breadcrumbs: breadcrumbs,
        fromDate: fromDate,
      })
    }
    return orgTree.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))
  }

  let refreshableOrgTree = fetchOrgTree($date)

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
  const updateDestinationUuids = async (fromDate: string, originUuid: string) => {
    const res = await graphQLClient().request(RelatedUnitsDocument, {
      fromDate: fromDate,
      org_unit: originUuid,
    })
    const newDestinations = res.related_units.objects.flatMap((related) => {
      const related_unit = related.validities[0]
      return selectedOriginOrg === related_unit.org_units[0].uuid
        ? related_unit.org_units[1].uuid
        : related_unit.org_units[0].uuid
    })
    selectedDestinationOrgs = [...newDestinations]

    let breadcrumbs: string[][] = []

    for (let child of selectedDestinationOrgs) {
      breadcrumbs.push(
        (await fetchParentTree(child, fromDate)).map((e) => e.uuid).reverse()
      )
    }
    refreshableOrgTree = fetchOrgTree($date, breadcrumbs)
  }

  const handleRadioChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    selectedOriginOrg = target.id
    updateDestinationUuids($date, selectedOriginOrg)
  }
</script>

<title>{$_("navigation.connections")} | OS2mo</title>

<div class="flex px-6 pt-6 pb-4 align-center">
  <h3 class="flex-1">{$_("navigation.connections")}</h3>
</div>

<div class="p-0 m-0 mb-4 w-full divider" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="rounded min-w-fit bg-slate-100">
    <div class="p-8 max-h-[70vh] overflow-auto">
      <div class="flex flex-row gap-6 w-1/2">
        <DateInput
          startValue={$date}
          bind:value={$fromDate.value}
          errors={$fromDate.errors}
          title={capital($_("date.change"))}
          id="from"
          required={true}
        />
        <div class="basis-1/2" />
      </div>
      <div class="flex flex-col gap-6 w-full sm:flex-row">
        {#await fetchOrgTree($date)}
          <p>{capital($_("loading"))}</p>
        {:then orgTree}
          <div class="w-1/2">
            <ul class="overflow-y-auto py-4 menu bg-base-100 text-base-content">
              {#each orgTree as child}
                <div on:change={handleRadioChange} class="">
                  <Node {...child} type="radio" {selectedOriginOrg} />
                </div>
              {/each}
            </ul>
          </div>
        {/await}
        {#await refreshableOrgTree then orgTree}
          <div class="w-1/2">
            <ul class="overflow-y-auto py-4 menu bg-base-100 text-base-content">
              {#each orgTree as child}
                <div class="">
                  <Node
                    {...child}
                    type="checkbox"
                    {selectedDestinationOrgs}
                    {selectedOriginOrg}
                  />
                </div>
              {/each}
            </ul>
          </div>
        {/await}
      </div>
    </div>
  </div>

  <div class="gap-4 py-6">
    <Button type="submit" title={capital($_("save"))} disabled={!selectedOriginOrg} />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      on:click={() => history.back()}
    />
  </div>
</form>
