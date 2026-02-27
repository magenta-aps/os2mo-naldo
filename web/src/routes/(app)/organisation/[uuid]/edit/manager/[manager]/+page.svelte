<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import type { FacetValidities } from "$lib/utils/classes"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { ManagerDocument, UpdateManagerDocument } from "./query.generated"
  import { findClosestValidity } from "$lib/utils/validities"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import SelectMultiple from "$lib/components/forms/shared/SelectMultiple.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getClasses } from "$lib/http/getClasses"
  import { getValidities } from "$lib/http/getValidities"
  import { normalizeManager } from "$lib/utils/normalizeForm"

  gql`
    query Manager($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      managers(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            person(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              name
            }
            manager_type(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              user_key
              name
            }
            manager_level(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              user_key
              name
            }
            responsibilities(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              name
              user_key
            }
            validity {
              from
              to
            }
            org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              name
              validity {
                from
                to
              }
            }
          }
        }
      }
    }

    mutation UpdateManager($input: ManagerUpdateInput!, $date: DateTime!) {
      manager_update(input: $input) {
        current(at: $date) {
          person {
            name
          }
        }
      }
    }
  `

  let startDate: string = $date
  let toDate: string
  let selectedOrgUnit: {
    uuid: string
    name: string
  }
  let selectedPerson: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const orgUnit = field("org_unit", "", [required()])
  const managerType = field("manager_type", "", [required()])
  const managerLevel = field("manager_level", "", [required()])
  const responsibilitiesField = field("responsibilities", undefined, [required()])
  const svelteForm = form(
    fromDate,
    orgUnit,
    managerType,
    managerLevel,
    responsibilitiesField
  )

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      await svelteForm.validate()
      if (!$svelteForm.valid) return
      if (result.type !== "success" || !result.data) return

      try {
        const mutation = await graphQLClient().request(UpdateManagerDocument, {
          input: result.data,
          date: result.data.validity.from,
        })
        $success = {
          message: capital(
            $_("success_edit_item", {
              values: {
                item: $_("manager", { values: { n: 0 } }),
                name: mutation.manager_update.current?.person?.[0].name,
              },
            })
          ),
          uuid: $page.params.uuid,
          type: "organisation",
        }
      } catch (err) {
        $error = { message: err }
      }
    }

  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  let facets: FacetValidities[]
  let abortController: AbortController
  $: {
    // Abort the previous request if a new one is about to start
    if (abortController) abortController.abort()
    abortController = new AbortController()

    const params = {
      currentDate: startDate,
      orgUuid: selectedOrgUnit?.uuid,
      facetUserKeys: ["manager_type", "manager_level", "responsibility"],
    }

    ;(async () => {
      validities = selectedOrgUnit
        ? await getValidities(selectedOrgUnit.uuid)
        : { from: null, to: null }
      try {
        facets = await getClasses(params, abortController.signal)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err)
        }
      }
    })()
  }

  let initialManager: any = null
  let hasChanges = false
  $: if (initialManager) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged =
      selectedOrgUnit?.uuid !== initialManager.org_unit ||
      selectedPerson?.uuid !== initialManager.person ||
      $managerType.value !== initialManager.manager_type ||
      $managerLevel.value !== initialManager.manager_level ||
      JSON.stringify($responsibilitiesField.value) !==
        JSON.stringify(initialManager.responsibility)

    const toDateExtended =
      toDate === "" ? initialManager.to !== null : toDate > (initialManager.to ?? null)
    hasChanges = editableChanged || toDateExtended
  }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("manager", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("manager", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( ManagerDocument, { uuid: $page.params.manager, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to") } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <Skeleton />
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const manager = data.managers.objects[0].validities[0]}
  {@const responsibilities = manager.responsibilities}
  {#if !initialManager}
    {@html (() => {
      initialManager = normalizeManager(manager)
      return ""
    })()}
  {/if}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={startDate}
            bind:validationValue={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={toDate ? toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={manager.validity.to ? manager.validity.to.split("T")[0] : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value}
            max={validities.to}
          />
        </div>
        <Search
          type="org-unit"
          at={startDate}
          startValue={{
            uuid: findClosestValidity(manager.org_unit, startDate).uuid,
            name: findClosestValidity(manager.org_unit, startDate).name,
          }}
          bind:value={selectedOrgUnit}
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          on:clear={() => ($orgUnit.value = "")}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        <Search
          type="employee"
          at={startDate}
          bind:value={selectedPerson}
          startValue={manager.person
            ? {
                uuid: findClosestValidity(manager.person, startDate).uuid,
                name: findClosestValidity(manager.person, startDate).name,
              }
            : undefined}
        />
        {#if facets}
          <div class="flex flex-row gap-6">
            <Select
              title={capital($_("manager_type"))}
              id="manager-type"
              startValue={manager.manager_type}
              bind:name={$managerType.value}
              errors={$managerType.errors}
              iterable={filterClassesByFacetUserKey(facets, "manager_type")}
              extra_classes="basis-1/2"
              required={true}
            />
            <Select
              title={capital($_("manager_level"))}
              id="manager-level"
              startValue={manager.manager_level}
              bind:name={$managerLevel.value}
              errors={$managerLevel.errors}
              iterable={filterClassesByFacetUserKey(facets, "manager_level")}
              extra_classes="basis-1/2"
              required={true}
            />
          </div>
          <SelectMultiple
            bind:name={$responsibilitiesField.value}
            errors={$responsibilitiesField.errors}
            title={capital($_("manager_responsibility"))}
            id="responsibility"
            startValue={responsibilities}
            iterable={filterClassesByFacetUserKey(facets, "responsibility")}
            required={true}
          />
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("manager", { values: { n: 1 } }) },
          })
        )}
        disabled={!hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/organisation/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
