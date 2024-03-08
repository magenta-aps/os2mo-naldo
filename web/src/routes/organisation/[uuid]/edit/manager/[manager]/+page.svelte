<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { ManagerAndFacetsDocument, UpdateManagerDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/search.svelte"
  import SelectMultiple from "$lib/components/forms/shared/selectMultiple.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"
  import { getMinMaxValidities } from "$lib/util/helpers"

  let toDate: string
  const fromDate = field("from", "", [required()])
  const managerType = field("manager_type", "", [required()])
  const managerLevel = field("manager_level", "", [required()])
  const responsibilitiesField = field("responsibilities", undefined, [required()])
  const svelteForm = form(fromDate, managerType, managerLevel, responsibilitiesField)

  gql`
    query ManagerAndFacets($uuid: [UUID!], $orgUnitUuid: [UUID!], $fromDate: DateTime) {
      facets(
        filter: { user_keys: ["manager_type", "manager_level", "responsibility"] }
      ) {
        objects {
          objects {
            uuid
            user_key
            classes {
              name
              uuid
              user_key
            }
          }
        }
      }
      managers(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          validities {
            uuid
            person {
              uuid
              name
            }
            manager_type {
              uuid
              user_key
              name
            }
            manager_level {
              uuid
              user_key
              name
            }
            responsibilities {
              uuid
              name
              user_key
            }
            validity {
              from
              to
            }
            org_unit {
              uuid
              name
            }
          }
        }
      }
      org_units(filter: { uuids: $orgUnitUuid, from_date: null, to_date: null }) {
        objects {
          validities {
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation UpdateManager($input: ManagerUpdateInput!) {
      manager_update(input: $input) {
        uuid
        objects {
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
            const mutation = await graphQLClient().request(UpdateManagerDocument, {
              input: result.data,
            })
            $success = {
              message: capital(
                $_("success_edit", {
                  values: {
                    item: $_("manager", { values: { n: 0 } }),
                    name: mutation.manager_update.objects[0]?.person?.[0].name,
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

{#await graphQLClient().request( ManagerAndFacetsDocument, { uuid: $page.params.manager, orgUnitUuid: $page.params.uuid, fromDate: $date } )}
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
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const manager = data.managers.objects[0].validities[0]}
  {@const responsibilities = manager.responsibilities}
  {@const facets = data.facets.objects}
  {@const validities = getMinMaxValidities(data.org_units.objects[0].validities)}

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
            min={$fromDate.value}
            max={validities.to}
          />
        </div>
        <Search
          type="org-unit"
          disabled={true}
          startValue={{
            uuid: manager.org_unit[0].uuid,
            name: manager.org_unit[0].name,
          }}
          required={true}
        />
        <Search
          type="employee"
          startValue={manager.person
            ? {
                uuid: manager.person[0].uuid,
                name: manager.person[0].name,
              }
            : undefined}
        />
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("manager_type"))}
            id="manager-type"
            startValue={manager.manager_type}
            bind:name={$managerType.value}
            errors={$managerType.errors}
            iterable={getClassesByFacetUserKey(facets, "manager_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title={capital($_("manager_level"))}
            id="manager-level"
            startValue={manager.manager_level}
            bind:name={$managerLevel.value}
            errors={$managerLevel.errors}
            iterable={getClassesByFacetUserKey(facets, "manager_level")}
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
          iterable={getClassesByFacetUserKey(facets, "responsibility")}
          required={true}
          multiple={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("edit_item", {
            values: { item: $_("manager", { values: { n: 1 } }) },
          })
        )}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  </form>
{/await}
