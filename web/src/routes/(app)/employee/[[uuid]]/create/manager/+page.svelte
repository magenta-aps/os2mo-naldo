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
  import { CreateManagerDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import SelectMultiple from "$lib/components/forms/shared/SelectMultiple.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import { getClasses } from "$lib/http/getClasses"
  import { getValidities } from "$lib/http/getValidities"

  gql`
    mutation CreateManager($input: ManagerCreateInput!, $date: DateTime!) {
      manager_create(input: $input) {
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

  const fromDate = field("from", "", [required()])
  const orgUnit = field("org_unit", "", [required()])
  const managerType = field("manager_type", "", [required()])
  const managerLevel = field("manager_level", "", [required()])
  const responsibilities = field("responsibilities", undefined, [required()])
  const svelteForm = form(
    fromDate,
    orgUnit,
    managerType,
    managerLevel,
    responsibilities
  )

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if (!$svelteForm.valid) return
      if (result.type !== "success" || !result.data) return

      try {
        const mutation = await graphQLClient().request(CreateManagerDocument, {
          input: result.data,
          date: result.data.validity.from,
        })
        $success = {
          message: capital(
            $_("success_create_item", {
              values: {
                item: $_("manager", { values: { n: 0 } }),
                name: mutation.manager_create.current?.person?.[0].name,
              },
            })
          ),
          uuid: $page.params.uuid,
          type: "employee",
        }
      } catch (err) {
        $error = { message: err }
      }
    }

  // Logic for updating datepicker intervals
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
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("manager", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("manager", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

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
          title={capital($_("date.end_date"))}
          id="to"
          min={$fromDate.value ? $fromDate.value : validities.from}
          max={validities.to}
        />
      </div>
      <Search
        type="org-unit"
        at={startDate}
        bind:name={$orgUnit.value}
        errors={$orgUnit.errors}
        on:clear={() => ($orgUnit.value = "")}
        bind:value={selectedOrgUnit}
        required={true}
      />
      <Breadcrumbs orgUnit={selectedOrgUnit} />
      {#if facets}
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("manager_type"))}
            id="manager-type"
            bind:name={$managerType.value}
            errors={$managerType.errors}
            iterable={filterClassesByFacetUserKey(facets, "manager_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title={capital($_("manager_level"))}
            id="manager-level"
            bind:name={$managerLevel.value}
            errors={$managerLevel.errors}
            iterable={filterClassesByFacetUserKey(facets, "manager_level")}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <SelectMultiple
          bind:name={$responsibilities.value}
          errors={$responsibilities.errors}
          on:clear={() => ($responsibilities.value = undefined)}
          title={capital($_("manager_responsibility"))}
          id="responsibility"
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
        $_("create_item", {
          values: { item: $_("manager", { values: { n: 1 } }) },
        })
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      href="{base}/employee/{$page.params.uuid}"
    />
  </div>
  <Error />
</form>
