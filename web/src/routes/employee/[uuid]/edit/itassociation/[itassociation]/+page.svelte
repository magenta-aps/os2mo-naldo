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
  import {
    ItAssociationAndFacetsDocument,
    UpdateItAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import {
    getClassUuidByUserKey,
    getClassesByFacetUserKey,
  } from "$lib/util/get_classes"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import { getITUserITSystemName } from "$lib/util/helpers"

  let fromDate: string
  let toDate: string
  let employeeUuid: string
  let orgUnitUuid: string
  let jobFunction: string
  let itUserUuid: string

  gql`
    query ITAssociationAndFacets($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: "engagement_job_function") {
        uuid
        user_key
        classes {
          user_key
          name
          uuid
        }
      }
      classes(user_keys: ["primary", "non-primary"]) {
        uuid
        user_key
      }
      associations(uuids: $uuid, from_date: $fromDate, it_association: true) {
        objects {
          uuid
          employee {
            uuid
            name
            itusers {
              itsystem {
                name
              }
              user_key
              uuid
            }
            validity {
              from
              to
            }
          }
          org_unit {
            uuid
          }
          it_user {
            itsystem {
              name
            }
            uuid
            user_key
          }
          job_function {
            name
          }
          primary {
            uuid
          }
          validity {
            from
            to
          }
        }
      }
    }

    mutation UpdateITAssociation($input: ITAssociationUpdateInput!) {
      itassociation_update(input: $input) {
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
          const mutation = await graphQLClient().request(UpdateItAssociationDocument, {
            input: result.data,
          })
          $success = {
            message: `IT-tilknytning for ${mutation.itassociation_update.objects[0].employee[0].name} er blevet redigeret`,
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

{#await graphQLClient().request( ItAssociationAndFacetsDocument, { uuid: $page.params.itassociation, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const itassociation = data.associations[0].objects[0]}
  {@const itusers = itassociation.employee[0].itusers}
  {@const facets = data.facets}
  {@const classes = data.classes}
  {@const minDate = itassociation.employee[0].validity.from.split("T")[0]}
  {@const itUserStartValue = getITUserITSystemName(itassociation.it_user)}

  <title>Rediger IT-tilknytning | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger IT-tilknytning</h3>
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
          />
          <DateInput
            bind:value={toDate}
            startValue={itassociation.validity.to
              ? itassociation.validity.to.split("T")[0]
              : null}
            title="Slutdato"
            id="to"
            min={fromDate}
          />
        </div>
        <Input
          title="Medarbejder UUID"
          id="employee-uuid"
          bind:value={employeeUuid}
          startValue={itassociation.employee[0].uuid}
          disabled
        />
        <Input
          title="Organisationsenhed UUID"
          id="org-unit-uuid"
          bind:value={orgUnitUuid}
          startValue={itassociation.org_unit[0].uuid}
          required={true}
        />
        <div class="flex flex-row gap-6">
          <Select
            bind:value={itUserUuid}
            title="IT-konto"
            id="it-user-uuid"
            startValue={itUserStartValue[0].name}
            iterable={getITUserITSystemName(itusers)}
            required={true}
            extra_classes="basis-1/2"
          />
          <Select
            title="Stillingsbetegnelse"
            id="job-function"
            startValue={itassociation.job_function?.name}
            bind:value={jobFunction}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
            extra_classes="basis-1/2"
          />
        </div>
        <div class="flex">
          <Checkbox
            title="Primær"
            id="primary"
            startValue={itassociation.primary?.uuid}
            value={getClassUuidByUserKey(classes, "primary")}
            extra_classes="checkbox-primary"
          />
        </div>
        <input
          hidden
          name="non-primary"
          id="non-primary"
          value={getClassUuidByUserKey(classes, "non-primary")}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger IT-tilknytning</button
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
