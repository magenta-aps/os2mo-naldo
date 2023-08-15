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
  import { FacetsAndOrgDocument, CreateManagerDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"

  let fromDate: string
  let toDate: string
  let orgUnitUuid: string
  let managerType: string
  let managerLevel: string
  let responsibility: string

  gql`
    query FacetsAndOrg($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: ["manager_type", "manager_level", "responsibility"]) {
        uuid
        user_key
        classes {
          name
          uuid
          user_key
        }
      }
      employees(uuids: $uuid, from_date: $fromDate) {
        objects {
          validity {
            from
            to
          }
        }
      }
    }

    mutation CreateManager($input: ManagerCreateInput!) {
      manager_create(input: $input) {
        objects {
          manager_type {
            name
          }
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
          const mutation = await graphQLClient().request(CreateManagerDocument, {
            input: result.data,
          })
          $success = {
            message: `Lederrolle er oprettet ${mutation.manager_create.objects[0]?.employee
                ? `for ${mutation.manager_create.objects[0].employee[0].name}`
                : ""
            }`,
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

{#await graphQLClient().request( FacetsAndOrgDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const facets = data.facets}
  {@const minDate = data.employees[0].objects[0].validity?.from.split("T")[0]}
  {@const maxDate = data.employees[0].objects[0].validity?.to?.split("T")[0]}

  <title>Opret Leder | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Opret leder</h3>
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
        <Input title="Organisationsenhed UUID" id="org-unit-uuid" bind:value={orgUnitUuid} />
        <div class="flex flex-row gap-6">
          <Select
            title="Ledertype"
            id="manager-type"
            bind:value={managerType}
            iterable={getClassesByFacetUserKey(facets, "manager_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title="Lederniveau"
            id="manager-level"
            bind:value={managerLevel}
            iterable={getClassesByFacetUserKey(facets, "manager_level")}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <Select
          title="Lederansvar"
          id="responsibility"
          bind:value={responsibility}
          iterable={getClassesByFacetUserKey(facets, "responsibility")}
          required={true}
        />
        <!-- Insert substitute field? -->
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Opret leder</button
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
