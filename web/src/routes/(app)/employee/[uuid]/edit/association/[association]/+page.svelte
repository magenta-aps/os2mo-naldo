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
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import {
    AssociationAndFacetsDocument,
    UpdateAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import type { FacetValidities } from "$lib/utils/classes"
  import { getValidities } from "$lib/http/getValidities"
  import { getClasses } from "$lib/http/getClasses"
  import { findClosestValidity } from "$lib/utils/validities"
  import SelectGroup from "$lib/components/forms/shared/SelectGroup.svelte"
  import { normalizeAssociation } from "$lib/utils/normalizeForm"

  gql`
    query AssociationAndFacets(
      $uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $getConfederations: Boolean!
      $currentDate: DateTime!
    ) {
      associations(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            person(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              name
              validity {
                from
                to
              }
            }
            org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              name
              validity {
                from
                to
              }
            }
            association_type {
              uuid
              user_key
              name
            }
            primary {
              uuid
              user_key
              name
            }
            substitute(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
              validity {
                from
                to
              }
            }
            trade_union {
              uuid
              user_key
              name
            }
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

    mutation UpdateAssociation($input: AssociationUpdateInput!, $date: DateTime!) {
      association_update(input: $input) {
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

  let associationType: { name: string; user_key: string; uuid: string }
  $: associationTypeUuid = associationType?.uuid

  const fromDate = field("from", "", [required()])
  const orgUnit = field("org_unit", "", [required()])
  const associationTypeField = field("association_type", "", [required()])
  const primary = field("primary", "", [])
  const substitute = field("substitute", "", [])
  const tradeUnion = field("trade_union", "", [])
  let svelteForm = form(
    fromDate,
    orgUnit,
    associationTypeField,
    primary,
    substitute,
    tradeUnion
  )

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
            const mutation = await graphQLClient().request(UpdateAssociationDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit_item", {
                  values: {
                    item: $_("association", { values: { n: 0 } }),
                    name: mutation.association_update.current?.person?.[0].name,
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

    // Make sure `currentDate` isn't sent if startDate is null.
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

  let initialAssociation: any = null
  let hasChanges = false
  $: if (initialAssociation) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged =
      selectedPerson?.uuid !== initialAssociation.person ||
      selectedOrgUnit?.uuid !== initialAssociation.org_unit ||
      $associationTypeField.value !== initialAssociation.association_type ||
      $primary.value !== initialAssociation.primary ||
      $substitute.value !== initialAssociation.substitute ||
      $tradeUnion.value !== initialAssociation.trade_union

    const toDateExtended =
      toDate === ""
        ? initialAssociation.to !== null
        : toDate > (initialAssociation.to ?? null)
    hasChanges = editableChanged || toDateExtended
  }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("association", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("association", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( AssociationAndFacetsDocument, { uuid: $page.params.association, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to"), getConfederations: env.PUBLIC_ENABLE_CONFEDERATIONS, currentDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const association = data.associations.objects[0].validities[0]}
  {@const topLevelFacets = data.classes?.objects}
  {#if !initialAssociation}
    {@html (() => {
      initialAssociation = normalizeAssociation(association)
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
            startValue={association.validity.to
              ? association.validity.to.split("T")[0]
              : null}
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
            uuid: findClosestValidity(association.person, startDate).uuid,
            name: findClosestValidity(association.person, startDate).name,
          }}
          bind:value={selectedPerson}
          disabled
          required={true}
        />
        <Search
          type="org-unit"
          at={startDate}
          startValue={{
            uuid: findClosestValidity(association.org_unit, startDate).uuid,
            name: findClosestValidity(association.org_unit, startDate).name,
          }}
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
              startValue={association.association_type
                ? association.association_type
                : undefined}
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
              bind:name={$primary.value}
              startValue={association.primary ? association.primary : undefined}
              iterable={filterClassesByFacetUserKey(facets, "primary_type")}
              extra_classes="basis-1/2"
              on:clear={() => ($primary.value = "")}
              isClearable={true}
            />
          </div>
          {#if associationType}
            {#if allowSubstitute(associationTypeUuid)}
              <Search
                id="substitute"
                title={capital($_("substitute"))}
                at={startDate}
                startValue={association.substitute.length
                  ? {
                      uuid: findClosestValidity(association.substitute, startDate).uuid,
                      name: findClosestValidity(association.substitute, startDate).name,
                    }
                  : undefined}
                type="employee"
                bind:name={$substitute.value}
                on:clear={() => ($substitute.value = "")}
              />
            {/if}
          {/if}
          {#if env.PUBLIC_ENABLE_CONFEDERATIONS}
            <SelectGroup
              id="trade-union"
              title={$_("trade_union")}
              bind:name={$tradeUnion.value}
              iterable={topLevelFacets}
              startValue={association.trade_union ? association.trade_union : undefined}
              on:clear={() => ($substitute.value = "")}
              isClearable={true}
            />
          {/if}
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("association", { values: { n: 1 } }) },
          })
        )}
        disabled={!hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
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
