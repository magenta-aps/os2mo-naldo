<script lang="ts">
  import { _ } from "svelte-i18n"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { FacetAndOrgDocument, CreateEngagementDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const employee = field("employee", "", [required()])
  const jobFunction = field("job_function", "", [required()])
  const engagementType = field("engagement_type", "", [required()])
  const svelteForm = form(fromDate, employee, jobFunction, engagementType)

  gql`
    query FacetAndOrg($uuid: [UUID!], $fromDate: DateTime) {
      facets(
        filter: {
          user_keys: ["engagement_type", "engagement_job_function", "primary_type"]
        }
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
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation CreateEngagement($input: EngagementCreateInput!) {
      engagement_create(input: $input) {
        objects {
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
            const mutation = await graphQLClient().request(CreateEngagementDocument, {
              input: result.data,
            })
            $success = {
              message: `Engagementet ${
                mutation.engagement_create.objects[0]?.employee
                  ? `for ${mutation.engagement_create.objects[0].employee?.[0].name}`
                  : ""
              } er oprettet fra d. ${$fromDate.value}`,
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

<title>Opret engagement | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Opret engagement</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( FacetAndOrgDocument, { uuid: $page.params.uuid, fromDate: $date } )}
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
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const facets = data.facets.objects}
  {@const minDate = data.org_units.objects[0].objects[0].validity?.from.split("T")[0]}
  {@const maxDate = data.org_units.objects[0].objects[0].validity?.to?.split("T")[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={$_("date.start_date")}
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title={$_("date.end_date")}
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
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
          <Input title="ID" id="user-key" extra_classes="basis-1/2" />
          <Select
            title={$_("job_function")}
            id="job-function"
            bind:name={$jobFunction.value}
            errors={$jobFunction.errors}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
            required={true}
            extra_classes="basis-1/2"
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={$_("engagement_type")}
            id="engagement-type"
            bind:name={$engagementType.value}
            errors={$engagementType.errors}
            iterable={getClassesByFacetUserKey(facets, "engagement_type")}
            required={true}
            extra_classes="basis-1/2"
          />
          <Select
            title={$_("primary")}
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
        >Opret engagement</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        {$_("cancel")}
      </button>
    </div>
    <Error />
  </form>
{/await}
