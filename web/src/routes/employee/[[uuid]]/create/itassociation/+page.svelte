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
  import { getITUserITSystemName, getValidities } from "$lib/util/helpers"
  import {
    FacetClassesAndEmployeeDocument,
    CreateItAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import {
    getClassUuidByUserKey,
    getClassesByFacetUserKey,
  } from "$lib/util/get_classes"
  import Checkbox from "$lib/components/forms/shared/Checkbox.svelte"
  import Search from "$lib/components/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { env } from "$env/dynamic/public"

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
    query FacetClassesAndEmployee($uuid: [UUID!], $currentDate: DateTime!) {
      facets(filter: { user_keys: "engagement_job_function" }) {
        objects {
          validities {
            uuid
            user_key
            classes(filter: { from_date: $currentDate }) {
              user_key
              name
              uuid
            }
          }
        }
      }
      classes(
        filter: { user_keys: ["primary", "non-primary"], from_date: $currentDate }
      ) {
        objects {
          validities {
            uuid
            user_key
          }
        }
      }
      employees(filter: { uuids: $uuid }) {
        objects {
          current(at: $currentDate) {
            uuid
            name
            itusers {
              itsystem {
                name
              }
              user_key
              uuid
            }
          }
        }
      }
    }

    mutation CreateITAssociation($input: ITAssociationCreateInput!, $date: DateTime!) {
      itassociation_create(input: $input) {
        current(at: $date) {
          person {
            name
          }
        }
      }
    }
  `

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  $: if (selectedOrgUnit) {
    ;(async () => {
      validities = await getValidities(selectedOrgUnit.uuid)
    })()
  } else {
    validities = { from: null, to: null }
  }

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(
              CreateItAssociationDocument,
              {
                input: result.data,
                date: result.data.validity.from,
              }
            )
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("itassociation", { values: { n: 0 } }),
                    name: mutation.itassociation_create.current?.person?.[0].name,
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
    $_("create_item", {
      values: { item: $_("itassociation", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("itassociation", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( FacetClassesAndEmployeeDocument, { uuid: $page.params.uuid, currentDate: $date } )}
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
      </div>
    </div>
  </div>
{:then data}
  {@const facets = data.facets.objects}
  {@const itusers = data.employees.objects[0].current?.itusers}
  {@const primaryClasses = data.classes.objects}
  {@const employee = data.employees.objects[0].current}

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
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <Search
          type="employee"
          startValue={{
            uuid: employee ? employee.uuid : undefined,
            name: employee ? employee.name : "",
          }}
          disabled
          required={true}
        />
        <Search
          type="org-unit"
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          on:clear={() => ($orgUnit.value = "")}
          bind:value={selectedOrgUnit}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("ituser", { values: { n: 1 } }))}
            id="it-user-uuid"
            bind:name={$itUser.value}
            errors={$itUser.errors}
            iterable={getITUserITSystemName(itusers ? itusers : [])}
            required={true}
            extra_classes="basis-1/2"
          />
          <Select
            title={env.PUBLIC_SHOW_EXTENSION_1 === "true"
              ? capital($_("job_code"))
              : capital($_("job_function", { values: { n: 1 } }))}
            id="job-function"
            bind:name={$jobFunction.value}
            errors={$jobFunction.errors}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
            required={true}
            extra_classes="basis-1/2"
          />
        </div>
        <div class="flex">
          <Checkbox
            title={capital($_("primary"))}
            id="primary"
            value={getClassUuidByUserKey(primaryClasses, "primary")}
          />
          <input
            hidden
            name="non-primary"
            id="non-primary"
            value={getClassUuidByUserKey(primaryClasses, "non-primary")}
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("create_item", {
            values: { item: $_("itassociation", { values: { n: 1 } }) },
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
