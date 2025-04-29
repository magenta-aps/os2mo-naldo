<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { FacetAndOrgDocument, CreateAssociationDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/getClasses"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities } from "$lib/util/helpers"
  import { MOConfig } from "$lib/stores/config"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import SelectGroup from "$lib/components/forms/shared/SelectGroup.svelte"

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

  let getDynamicFacet: boolean = false
  let dynamicFacetUuid: string | undefined

  // Maybe we need to JSON.parse our config, so we avoid doing it here?
  $: if ($MOConfig) {
    if (JSON.parse($MOConfig.confdb_association_dynamic_facets)) {
      getDynamicFacet = true
      dynamicFacetUuid = JSON.parse($MOConfig.confdb_association_dynamic_facets)
    }
  }

  const allowSubstitute = (associationTypeUuid: string) => {
    // Check if the selected associationType allows a substitute
    return $MOConfig &&
      JSON.parse($MOConfig.confdb_substitute_roles).includes(associationTypeUuid)
      ? true
      : false
  }

  gql`
    query FacetAndOrg(
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
              name
              uuid
              user_key
            }
          }
        }
      }
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
      ...MedOrg
    }
    fragment MedOrg on Query {
      classes(filter: { facet: { uuids: $dynamicFacetUuid } })
        @include(if: $getDynamicFacet) {
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

{#await graphQLClient().request( FacetAndOrgDocument, { uuid: $page.params.uuid, getDynamicFacet: getDynamicFacet, dynamicFacetUuid: dynamicFacetUuid, currentDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
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
  {@const facets = data.facets.objects}
  {@const orgUnit = data.org_units.objects[0].current}
  {@const validities = getMinMaxValidities(data.org_units.objects[0].validities)}
  {@const topLevelFacets = data.classes?.objects}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
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
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("association_type"))}
            id="association-type"
            bind:value={associationType}
            bind:name={$associationTypeField.value}
            errors={$associationTypeField.errors}
            iterable={getClassesByFacetUserKey(facets, "association_type")}
            extra_classes="basis-1/2"
            required={true}
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
          {#if allowSubstitute(associationTypeUuid)}
            <Search id="substitute" title={capital($_("substitute"))} type="employee" />
          {/if}
        {/if}
        {#if $MOConfig && JSON.parse($MOConfig.confdb_association_dynamic_facets)}
          <SelectGroup
            id="trade-union"
            title={$_("trade_union")}
            iterable={topLevelFacets}
          />
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
