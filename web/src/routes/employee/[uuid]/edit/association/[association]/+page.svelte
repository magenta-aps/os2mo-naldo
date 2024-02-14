<script lang="ts">
  import { _ } from "svelte-i18n"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import {
    AssociationAndFacetsDocument,
    UpdateAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"

  let toDate: string
  let selectedOrgUnit: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const orgUnit = field("org_unit", "", [required()])
  const associationType = field("association_type", "", [required()])
  const svelteForm = form(fromDate, orgUnit, associationType)

  gql`
    query AssociationAndFacets($uuid: [UUID!], $fromDate: DateTime) {
      facets(filter: { user_keys: ["association_type", "primary_type"] }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              uuid
              user_key
              name
            }
          }
        }
      }
      associations(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            employee {
              uuid
              name
              validity {
                from
                to
              }
            }
            org_unit {
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
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation UpdateAssociation($input: AssociationUpdateInput!) {
      association_update(input: $input) {
        objects {
          uuid
          employee {
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
            })
            $success = {
              message: `Tilknytningen ${
                mutation.association_update.objects[0].employee
                  ? `for ${mutation.association_update.objects[0].employee[0].name}`
                  : ""
              } redigeres fra d. ${$fromDate.value}`,
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

<title>{$_("edit")} {$_("association")} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{$_("edit")} {$_("association")}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( AssociationAndFacetsDocument, { uuid: $page.params.association, fromDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
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
  {@const association = data.associations.objects[0].objects[0]}
  {@const employee = association.employee[0]}
  {@const facets = data.facets.objects}
  {@const minDate = association.employee[0].validity?.from?.split("T")[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={$_("date.start_date")}
            id="from"
            min={minDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={association.validity.to
              ? association.validity.to.split("T")[0]
              : null}
            title={$_("date.end_date")}
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
          />
        </div>
        <Search
          type="employee"
          startValue={{
            uuid: employee.uuid,
            name: employee.name,
          }}
          disabled
          required={true}
        />
        <Search
          type="org-unit"
          startValue={{
            uuid: association.org_unit[0].uuid,
            name: association.org_unit[0].name,
          }}
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          on:clear={() => ($orgUnit.value = "")}
          bind:value={selectedOrgUnit}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        <div class="flex flex-row gap-6">
          <Select
            title={$_("association_type")}
            id="association-type"
            startValue={association.association_type
              ? association.association_type
              : undefined}
            bind:name={$associationType.value}
            errors={$associationType.errors}
            iterable={getClassesByFacetUserKey(facets, "association_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title={$_("primary")}
            id="primary"
            startValue={association.primary ? association.primary : undefined}
            iterable={getClassesByFacetUserKey(facets, "primary_type")}
            extra_classes="basis-1/2"
            isClearable={true}
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{$_("edit")} {$_("association")}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        {$_("cancel")}
      </button>
    </div>
    <Error />
  </form>
{/await}
