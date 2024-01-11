<script lang="ts">
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
  const itUser = field("it_user", "", [required()])
  const jobFunction = field("job_function", "", [required()])
  const svelteForm = form(fromDate, itUser, jobFunction, orgUnit)

  gql`
    query ITAssociationAndFacets($uuid: [UUID!], $fromDate: DateTime) {
      facets(filter: { user_keys: "engagement_job_function" }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              user_key
              name
              uuid
            }
          }
        }
      }
      classes(filter: { user_keys: ["primary", "non-primary"] }) {
        objects {
          objects {
            uuid
            name
            user_key
          }
        }
      }
      associations(
        filter: { uuids: $uuid, from_date: $fromDate, it_association: true }
      ) {
        objects {
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
              name
            }
            it_user {
              itsystem {
                name
              }
              uuid
              user_key
            }
            job_function {
              uuid
              name
            }
            primary {
              name
              uuid
            }
            validity {
              from
              to
            }
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
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(
              UpdateItAssociationDocument,
              {
                input: result.data,
              }
            )
            $success = {
              message: `IT-tilknytningen ${
                mutation.itassociation_update.objects[0].employee
                  ? `for ${mutation.itassociation_update.objects[0].employee[0].name}`
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

<title>Rediger IT-tilknytning | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Rediger IT-tilknytning</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( ItAssociationAndFacetsDocument, { uuid: $page.params.itassociation, fromDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const itassociation = data.associations.objects[0].objects[0]}
  {@const itusers = itassociation.employee[0].itusers}
  {@const facets = data.facets.objects}
  {@const classes = data.classes.objects}
  {@const minDate = itassociation.employee[0].validity?.from?.split("T")[0]}
  {@const itUserStartValue = getITUserITSystemName(itassociation.it_user)}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <!-- FIXME: DATES AGAIN :))) -->
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title="Startdato"
            id="from"
            min={minDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={itassociation.validity.to
              ? itassociation.validity.to.split("T")[0]
              : null}
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
          />
        </div>
        <Search
          type="employee"
          startValue={{
            uuid: itassociation.employee[0].uuid,
            name: itassociation.employee[0].name,
          }}
          disabled
          required={true}
        />
        <Search
          type="org-unit"
          startValue={{
            uuid: itassociation.org_unit[0].uuid,
            name: itassociation.org_unit[0].name,
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
            title="IT-konto"
            id="it-user-uuid"
            startValue={itUserStartValue[0]}
            bind:name={$itUser.value}
            errors={$itUser.errors}
            iterable={getITUserITSystemName(itusers)}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title="Stillingsbetegnelse"
            id="job-function"
            startValue={itassociation.job_function
              ? itassociation.job_function
              : undefined}
            bind:name={$jobFunction.value}
            errors={$jobFunction.errors}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <div class="flex">
          <Checkbox
            title="Primær"
            id="primary"
            startValue={itassociation.primary?.uuid}
            value={getClassUuidByUserKey(classes, "primary")}
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
