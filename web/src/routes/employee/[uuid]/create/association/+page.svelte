<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import {
    FacetAndEmployeeDocument,
    CreateAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import SelectGroup from "$lib/components/forms/shared/SelectGroup.svelte"
  import { getMinMaxValidities } from "$lib/util/helpers"
  import { MOConfig } from "$lib/stores/config"

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
  let substitute = field("substitute", "")
  let svelteForm = form(fromDate, orgUnit, associationTypeField, substitute)

  let getDynamicFacet: boolean = false
  let dynamicFacetUuid: string | undefined

  // Maybe we need to JSON.parse our config, so we avoid doing it here?
  if ($MOConfig && JSON.parse($MOConfig.confdb_association_dynamic_facets)) {
    getDynamicFacet = true
    dynamicFacetUuid = JSON.parse($MOConfig.confdb_association_dynamic_facets)
  }

  const isSubstituteNeeded = (associationTypeUuid: string) => {
    // Check if the selected associationType needs a substitute, if true, make the field required and update the form validation
    if (
      $MOConfig &&
      JSON.parse($MOConfig.confdb_substitute_roles).includes(associationTypeUuid)
    ) {
      substitute = field("substitute", "", [required()])
      svelteForm = form(fromDate, orgUnit, associationTypeField, substitute)
      return true
    } else {
      substitute = field("substitute", "")
      svelteForm = form(fromDate, orgUnit, associationTypeField, substitute)
      return false
    }
  }

  gql`
    query FacetAndEmployee(
      $uuid: [UUID!]
      $getDynamicFacet: Boolean!
      $dynamicFacetUuid: [UUID!]
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
      employees(filter: { uuids: $uuid, from_date: null, to_date: null }) {
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
      ...MedOrg
    }
    fragment MedOrg on Query {
      classes(filter: { facet: { uuids: $dynamicFacetUuid } })
        @include(if: $getDynamicFacet) {
        objects {
          objects {
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

{#await graphQLClient().request( FacetAndEmployeeDocument, { uuid: $page.params.uuid, getDynamicFacet: getDynamicFacet, dynamicFacetUuid: dynamicFacetUuid, currentDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
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
  {@const facets = data.facets.objects}
  {@const employee = data.employees.objects[0].current}
  {@const validities = getMinMaxValidities(data.employees.objects[0].validities)}
  {@const topLevelFacets = data.classes?.objects}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <!-- TODO: dynamically change dates depending on which org has been chosen -->
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
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
        <!-- FIXME: Either allow undefined or use `validities` when datepickers -->
        <!-- use org_unit validities instead of employee -->

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
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          on:clear={() => ($orgUnit.value = "")}
          bind:value={selectedOrgUnit}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("association_type"))}
            id="association-type"
            bind:value={associationType}
            bind:name={$associationTypeField.value}
            errors={$associationTypeField.errors}
            iterable={getClassesByFacetUserKey(facets, "association_type")}
            required={true}
            extra_classes="basis-1/2"
          />
          <Select
            title={capital($_("primary"))}
            id="primary"
            iterable={getClassesByFacetUserKey(facets, "primary_type")}
            extra_classes="basis-1/2"
            isClearable={true}
          />
        </div>
        {#if associationType}
          {#if isSubstituteNeeded(associationTypeUuid)}
            <Search
              id="substitute"
              title={capital($_("substitute"))}
              bind:name={$substitute.value}
              errors={$substitute.errors}
              type="employee"
              required={true}
            />
          {/if}
        {/if}
        {#if $MOConfig && JSON.parse($MOConfig.confdb_association_dynamic_facets)}
          <SelectGroup
            id="trade-union"
            title={$_("trade_union")}
            iterable={topLevelFacets ? topLevelFacets : []}
          />
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("create_item", {
            values: { item: $_("association", { values: { n: 1 } }) },
          })
        )}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  </form>
{/await}
