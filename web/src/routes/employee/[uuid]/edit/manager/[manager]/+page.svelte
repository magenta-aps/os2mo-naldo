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
  import { ManagerAndFacetsDocument, UpdateManagerDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/Search.svelte"
  import SelectMultiple from "$lib/components/forms/shared/SelectMultiple.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities } from "$lib/util/helpers"

  let toDate: string
  let selectedOrgUnit: {
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

  gql`
    query ManagerAndFacets(
      $uuid: [UUID!]
      $employeeUuid: [UUID!]
      $fromDate: DateTime
    ) {
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
            manager_type {
              uuid
              name
            }
            manager_level {
              uuid
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
              validity {
                from
                to
              }
            }
          }
        }
      }
      employees(filter: { uuids: $employeeUuid, from_date: null, to_date: null }) {
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
            const mutation = await graphQLClient().request(UpdateManagerDocument, {
              input: result.data,
            })
            $success = {
              message: capital(
                $_("success_edit", {
                  values: {
                    item: $_("manager", { values: { n: 0 } }),
                    name: mutation.manager_update.objects[0]?.employee?.[0].name,
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

{#await graphQLClient().request( ManagerAndFacetsDocument, { uuid: $page.params.manager, employeeUuid: $page.params.uuid, fromDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <!-- TODO: Make Skeleton better for Breadcrumbs? -->
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
  {@const validities = getMinMaxValidities(data.employees.objects[0].validities)}

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
        <Search
          type="org-unit"
          startValue={{
            uuid: manager.org_unit[0].uuid,
            name: manager.org_unit[0].name,
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
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  </form>
{/await}
