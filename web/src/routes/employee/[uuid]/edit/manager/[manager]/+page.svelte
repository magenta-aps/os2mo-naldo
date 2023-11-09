<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import SelectNew from "$lib/components/forms/shared/selectNew.svelte"
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

  let toDate: string

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
    query ManagerAndFacets($uuid: [UUID!], $fromDate: DateTime) {
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
          objects {
            uuid
            employee {
              uuid
              name
            }
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
              message: `Lederrollen ${
                mutation.manager_update.objects[0].employee
                  ? `for ${mutation.manager_update.objects[0].employee[0].name}`
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

{#await graphQLClient().request( ManagerAndFacetsDocument, { uuid: $page.params.manager, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const manager = data.managers.objects[0].objects[0]}
  {@const responsibilities = manager.responsibilities}
  {@const facets = data.facets.objects}
  {@const minDate = manager.org_unit[0].validity.from.split("T")[0]}
  {@const maxDate = manager.validity?.to?.split("T")[0]}

  <title>Redigér Leder | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Redigér leder</h3>
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
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>
        <Search
          type="org-unit"
          startValue={{
            uuid: manager.org_unit[0].uuid,
            name: manager.org_unit[0].name,
            attrs: [],
          }}
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          on:clear={() => ($orgUnit.value = "")}
          required={true}
        />
        <div class="flex flex-row gap-6">
          <SelectNew
            title="Ledertype"
            id="manager-type"
            startValue={manager.manager_type}
            bind:name={$managerType.value}
            errors={$managerType.errors}
            iterable={getClassesByFacetUserKey(facets, "manager_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <SelectNew
            title="Lederniveau"
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
          bind:responsibilities={$responsibilitiesField.value}
          errors={$responsibilitiesField.errors}
          title="Lederansvar"
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
        >Redigér leder</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
