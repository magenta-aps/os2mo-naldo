<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import {
    FacetAndEmployeeDocument,
    CreateAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import type { FacetValidities } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import SelectGroup from "$lib/components/forms/shared/SelectGroup.svelte"
  import { getClasses } from "$lib/http/getClasses"
  import { getValidities } from "$lib/http/getValidities"

  gql`
    query FacetAndEmployee(
      $uuid: [UUID!]
      $getConfederations: Boolean!
      $currentDate: DateTime!
    ) {
      facets(filter: { user_keys: ["association_type", "primary_type"] }) {
        objects {
          validities {
            uuid
            user_key
            classes(filter: { from_date: $currentDate }) {
              user_key
              name
              uuid
            }
          }
        }
      }
      employees(filter: { uuids: $uuid }) {
        objects {
          current(at: $currentDate) {
            uuid
            name
          }
        }
      }
      ...Confederations
    }
    fragment Confederations on Query {
      classes(filter: { facet: { user_keys: "confederation" } })
        @include(if: $getConfederations) {
        objects {
          current(at: $currentDate) {
            top_level_facet {
              uuid
              user_key
            }
            name
            children {
              name
              user_key
              uuid
            }
          }
        }
      }
    }

    mutation CreateAssociation($input: AssociationCreateInput!, $date: DateTime!) {
      association_create(input: $input) {
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
  let associationType: { name: string; user_key: string; uuid: string }
  $: associationTypeUuid = associationType?.uuid

  const fromDate = field("from", "", [required()])
  const orgUnit = field("org_unit", "", [required()])
  const associationTypeField = field("association_type", "", [required()])
  let svelteForm = form(fromDate, orgUnit, associationTypeField)

  const allowSubstitute = (associationTypeUuid: string) => {
    // Check if the selected associationType allows a substitute
    return env.PUBLIC_SUBSTITUTE_ROLES.includes(associationTypeUuid) ? true : false
  }

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(CreateAssociationDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("association", { values: { n: 0 } }),
                    name: mutation.association_create.current?.person?.[0].name,
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
      facetUserKeys: ["association_type", "primary_type"],
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
      values: { item: $_("association", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("association", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( FacetAndEmployeeDocument, { uuid: $page.params.uuid, getConfederations: env.PUBLIC_ENABLE_CONFEDERATIONS, currentDate: $date } )}
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
      </div>
    </div>
  </div>
{:then data}
  {@const employee = data.employees.objects[0].current}
  {@const topLevelFacets = data.classes?.objects}

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
        <!-- TODO: make optional when GraphQL agrees -->
        <Search
          type="employee"
          startValue={{
            uuid: employee ? employee.uuid : undefined,
            name: employee ? employee.name : "",
          }}
          disabled
          required={true}
        />
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
              title={capital($_("association_type"))}
              id="association-type"
              bind:value={associationType}
              bind:name={$associationTypeField.value}
              errors={$associationTypeField.errors}
              iterable={filterClassesByFacetUserKey(facets, "association_type")}
              required={true}
              extra_classes="basis-1/2"
            />
            <Select
              title={capital($_("primary"))}
              id="primary"
              iterable={filterClassesByFacetUserKey(facets, "primary_type")}
              extra_classes="basis-1/2"
              isClearable={true}
            />
          </div>
          {#if associationType}
            {#if allowSubstitute(associationTypeUuid)}
              <Search
                id="substitute"
                title={capital($_("substitute"))}
                type="employee"
                at={startDate}
              />
            {/if}
          {/if}
          {#if env.PUBLIC_ENABLE_CONFEDERATIONS}
            <SelectGroup
              id="trade-union"
              title={$_("trade_union")}
              iterable={topLevelFacets ? topLevelFacets : []}
            />
          {/if}
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("create_item", {
            values: { item: $_("association", { values: { n: 1 } }) },
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
{/await}
