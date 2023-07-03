<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import {
    ManagerClassesAndOrgDocument,
    UpdateManagerDocument,
  } from "./query.generated"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"

  let fromDate: string
  let toDate: string
  let employeeUuid: string
  let managerLevel: string
  let managerType: string
  let responsibilities: string

  gql`
    query ManagerClassesAndOrg($uuid: [UUID!], $fromDate: DateTime) {
      managers(uuids: $uuid, from_date: $fromDate) {
        objects {
          uuid
          user_key
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
          org_unit {
            name
            validity {
              from
              to
            }
          }
          validity {
            from
            to
          }
        }
      }
      facets(user_keys: ["manager_type", "manager_level", "responsibility"]) {
        classes {
          name
          uuid
        }
      }
    }

    mutation UpdateManager($input: ManagerUpdateInput!) {
      manager_update(input: $input) {
        uuid
      }
    }
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          await graphQLClient().request(UpdateManagerDocument, {
            input: result.data,
          })

          $success = {
            message: "IT kontoen er blevet redigeret",
            uuid: $page.params.uuid,
            type: "organisation",
          }
          setTimeout(() => goto(`${base}/organisation/${$page.params.uuid}`), 200)
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( ManagerClassesAndOrgDocument, { uuid: $page.params.manager, fromDate: $date } )}
  Henter data...
{:then data}
  {@const manager = data.managers[0].objects[0]}
  {console.log(manager)}
  {@const facets = data.facets}
  {@const minDate = manager.org_unit[0].validity.from.split("T")[0]}
  {@const maxDate = manager.org_unit[0].validity.to?.split("T")[0]}

  <title>Rediger leder-rolle for {manager.org_unit[0].name} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger leder-rolle for {manager.org_unit[0].name}</h3>
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
            startValue={manager.validity.to ? manager.validity.to.split("T")[0] : null}
            title="Slutdato"
            id="to"
            min={fromDate ? fromDate : minDate}
            max={maxDate}
          />
        </div>
        <Input
          title="Medarbejder UUID"
          id="employee-uuid"
          startValue={manager.employee ? manager.employee[0].uuid : null}
          bind:value={employeeUuid}
        />

        <div class="flex flex-row gap-6">
          <Select
            title="Ledertype"
            id="manager-type"
            startValue={manager.manager_type.name}
            bind:value={managerType}
            extra_classes="basis-1/2"
            iterable={facets[2].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
            required={true}
          />
          <Select
            title="Lederniveau"
            id="manager-level"
            startValue={manager.manager_level.name}
            bind:value={managerLevel}
            extra_classes="basis-1/2"
            iterable={facets[0].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
            required={true}
          />
        </div>
        <div class="flex">
          <!-- Need to be able to pick more than 1 -->
          <Select
            title="Lederansvar"
            id="responsibility"
            startValue={manager.responsibilities[0] ? manager.responsibilities[0].name : undefined}
            bind:value={responsibilities}
            extra_classes="basis-1/2"
            iterable={facets[1].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
            required={true}
        />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger Leder</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
