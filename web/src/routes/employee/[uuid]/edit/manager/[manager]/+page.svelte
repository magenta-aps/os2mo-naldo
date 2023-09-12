<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
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

  let fromDate: string
  let toDate: string
  let orgUnitUuid: string
  let managerType: string
  let managerLevel: string
  let responsibility: string

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
            }
            validity {
              from
              to
            }
            org_unit {
              uuid
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
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(UpdateManagerDocument, {
            input: result.data,
          })
          $success = {
            message: `Tilknytning for ${
              mutation.manager_update.objects[0].employee
                ? mutation.manager_update.objects[0].employee
                : ""
            } er blevet redigeret`,
            uuid: $page.params.uuid,
            type: "employee",
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( ManagerAndFacetsDocument, { uuid: $page.params.manager, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const manager = data.managers.objects[0].objects[0]}
  {@const facets = data.facets.objects}
  {@const minDate = manager.org_unit[0].validity.from.split("T")[0]}
  {@const maxDate = manager.validity?.to?.split("T")[0]}

  <title>Redigér Leder | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Redigér leder</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={fromDate}
            startValue={$date}
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
          />
          <DateInput
            bind:value={toDate}
            title="Slutdato"
            id="to"
            min={fromDate ? fromDate : minDate}
            max={maxDate}
          />
        </div>
        <!-- We need some sort of input, to choose an org_unit. !-->
        <Input
          title="Organisationsenhed UUID"
          id="org-unit-uuid"
          bind:value={orgUnitUuid}
          startValue={manager.org_unit[0].uuid}
          required={true}
        />
        <Search type="org-unit" />
        <div class="flex flex-row gap-6">
          <Select
            title="Ledertype"
            id="manager-type"
            bind:value={managerType}
            startValue={manager.manager_type.name}
            iterable={getClassesByFacetUserKey(facets, "manager_type")}
            extra_classes="basis-1/2"
          />
          <Select
            title="Lederniveau"
            id="manager-level"
            bind:value={managerLevel}
            startValue={manager.manager_level.name}
            iterable={getClassesByFacetUserKey(facets, "manager_level")}
            extra_classes="basis-1/2"
          />
        </div>
        <Select
          title="Lederansvar"
          id="responsibility"
          bind:value={responsibility}
          startValue={manager.responsibilities[0].name}
          iterable={getClassesByFacetUserKey(facets, "responsibility")}
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
