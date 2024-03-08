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
  import { FacetAndOrgDocument, CreateAssociationDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"
  import { getMinMaxValidities } from "$lib/util/helpers"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const employee = field("employee", "", [required()])
  const associationType = field("association_type", "", [required()])
  const svelteForm = form(fromDate, employee, associationType)

  gql`
    query FacetAndOrg($uuid: [UUID!]) {
      facets(filter: { user_keys: ["association_type", "primary_type"] }) {
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
      org_units(filter: { uuids: $uuid, from_date: null, to_date: null }) {
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

    mutation CreateAssociation($input: AssociationCreateInput!) {
      association_create(input: $input) {
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
            const mutation = await graphQLClient().request(CreateAssociationDocument, {
              input: result.data,
            })
            $success = {
              message: capital(
                $_("success_create", {
                  values: {
                    item: $_("association", { values: { n: 0 } }),
                    name: mutation.association_create.objects[0]?.person?.[0].name,
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
    $_("create_item", {
      values: { item: $_("association", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("association", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request(FacetAndOrgDocument, { uuid: $page.params.uuid })}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
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
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <Search
          type="employee"
          bind:name={$employee.value}
          errors={$employee.errors}
          on:clear={() => ($employee.value = "")}
          required={true}
        />
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("association_type"))}
            id="association-type"
            bind:name={$associationType.value}
            errors={$associationType.errors}
            iterable={getClassesByFacetUserKey(facets, "association_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title={capital($_("primary"))}
            id="primary"
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
        >{capital(
          $_("create_item", {
            values: { item: $_("association", { values: { n: 1 } }) },
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
