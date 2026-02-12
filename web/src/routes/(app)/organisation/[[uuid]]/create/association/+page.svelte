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
  import { FacetAndOrgDocument, CreateAssociationDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import type { FacetValidities } from "$lib/utils/classes"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getClasses } from "$lib/http/getClasses"
  import { getValidities } from "$lib/http/getValidities"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import SelectGroup from "$lib/components/forms/shared/SelectGroup.svelte"

  gql`
    query FacetAndOrg(
      $uuid: [UUID!]
      $getConfederations: Boolean!
      $currentDate: DateTime!
    ) {
      org_units(filter: { uuids: $uuid, from_date: null, to_date: null }) {
        objects {
          current {
            uuid
            name
          }
          validities {
            validity {
              from
              to
            }
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
  const employee = field("employee", "", [required()])
  const associationTypeField = field("association_type", "", [required()])
  let svelteForm = form(fromDate, employee, associationTypeField)

  const allowSubstitute = (associationTypeUuid: string) => {
    // Check if the selected associationType allows a substitute
    return env.PUBLIC_SUBSTITUTE_ROLES.includes(associationTypeUuid) ? true : false
  }

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
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
              type: "organisation",
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

{#await graphQLClient().request( FacetAndOrgDocument, { uuid: $page.params.uuid, getConfederations: env.PUBLIC_ENABLE_CONFEDERATIONS, currentDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const orgUnit = data.org_units.objects[0].current}
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
        <Search
          type="org-unit"
          startValue={{
            uuid: orgUnit ? orgUnit.uuid : undefined,
            name: orgUnit ? orgUnit.name : "",
          }}
          bind:value={selectedOrgUnit}
          disabled
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        <!-- TODO: make optional when GraphQL agrees -->
        <Search
          type="employee"
          bind:name={$employee.value}
          errors={$employee.errors}
          on:clear={() => ($employee.value = "")}
          required
        />
        {#if facets}
          <div class="flex flex-row gap-6">
            <Select
              title={capital($_("association_type"))}
              id="association-type"
              bind:value={associationType}
              bind:name={$associationTypeField.value}
              errors={$associationTypeField.errors}
              iterable={filterClassesByFacetUserKey(facets, "association_type")}
              extra_classes="basis-1/2"
              required={true}
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
              />
            {/if}
          {/if}
          {#if env.PUBLIC_ENABLE_CONFEDERATIONS}
            <SelectGroup
              id="trade-union"
              title={$_("trade_union")}
              iterable={topLevelFacets}
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
        href="{base}/organisation/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
