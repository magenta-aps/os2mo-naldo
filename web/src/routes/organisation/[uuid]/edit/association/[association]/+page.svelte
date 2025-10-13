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
    AssociationAndFacetDocument,
    UpdateAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities, findClosestValidity } from "$lib/utils/validities"
  import { MOConfig } from "$lib/stores/config"
  import SelectGroup from "$lib/components/forms/shared/SelectGroup.svelte"

  let toDate: string

  let associationType: { name: string; user_key: string; uuid: string }
  $: associationTypeUuid = associationType?.uuid

  const fromDate = field("from", "", [required()])
  const employee = field("employee", "", [required()])
  const associationTypeField = field("association_type", "", [required()])
  let svelteForm = form(fromDate, employee, associationTypeField)

  const allowSubstitute = (associationTypeUuid: string) => {
    // Check if the selected associationType allows a substitute
    return $MOConfig &&
      JSON.parse($MOConfig.confdb_substitute_roles).includes(associationTypeUuid)
      ? true
      : false
  }

  gql`
    query AssociationAndFacet(
      $uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $getConfederations: Boolean!
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
      associations(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            person(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              name
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
            org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
              validity {
                from
                to
              }
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
              type: "organisation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

{#await graphQLClient().request( AssociationAndFacetDocument, { uuid: $page.params.association, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to"), getConfederations: env.PUBLIC_ENABLE_CONFEDERATIONS, currentDate: $date } )}
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
  {@const association = data.associations.objects[0].validities[0]}
  {@const facets = data.facets.objects}
  {@const validities = getMinMaxValidities(
    data.associations.objects[0].validities[0].org_unit
  )}
  {@const topLevelFacets = data.classes?.objects}

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
            startValue={association.validity.to
              ? association.validity.to.split("T")[0]
              : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value}
            max={validities.to}
          />
        </div>
        <!-- TODO: make optional when GraphQL agrees -->
        <Search
          type="employee"
          startValue={{
            uuid: findClosestValidity(association.person, $date).uuid,
            name: findClosestValidity(association.person, $date).name,
          }}
          bind:name={$employee.value}
          errors={$employee.errors}
          on:clear={() => ($employee.value = "")}
          required={true}
        />
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("association_type"))}
            id="association-type"
            startValue={association.association_type
              ? association.association_type
              : undefined}
            bind:name={$associationTypeField.value}
            bind:value={associationType}
            errors={$associationTypeField.errors}
            iterable={filterClassesByFacetUserKey(facets, "association_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title={capital($_("primary"))}
            id="primary"
            startValue={association.primary ? association.primary : undefined}
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
              startValue={association.substitute.length
                ? {
                    uuid: findClosestValidity(association.substitute, $date).uuid,
                    name: findClosestValidity(association.substitute, $date).name,
                  }
                : undefined}
              type="employee"
            />
          {/if}
        {/if}
        {#if env.PUBLIC_ENABLE_CONFEDERATIONS}
          <SelectGroup
            id="trade-union"
            title={$_("trade_union")}
            iterable={topLevelFacets}
            startValue={association.trade_union ? association.trade_union : undefined}
          />
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
