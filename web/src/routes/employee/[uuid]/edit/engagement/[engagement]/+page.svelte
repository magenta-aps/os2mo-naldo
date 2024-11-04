<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import type { SubmitFunction } from "./$types"
  import {
    EngagementAndFacetDocument,
    UpdateEngagementDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities, getValidities } from "$lib/util/helpers"

  let toDate: string
  let selectedOrgUnit: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const orgUnit = field("org_unit", "", [required()])
  const jobFunction = field("job_function", "", [required()])
  const engagementType = field("engagement_type", "", [required()])
  const svelteForm = form(fromDate, orgUnit, jobFunction, engagementType)

  gql`
    query EngagementAndFacet(
      $uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $currentDate: DateTime
    ) {
      facets(
        filter: {
          user_keys: ["engagement_type", "engagement_job_function", "primary_type"]
        }
      ) {
        objects {
          validities {
            uuid
            user_key
            classes(filter: { from_date: $currentDate }) {
              name
              uuid
              user_key
            }
          }
        }
      }
      engagements(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            engagement_type {
              uuid
              name
            }
            job_function {
              uuid
              name
            }
            primary {
              uuid
              name
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

    mutation UpdateEngagement($input: EngagementUpdateInput!, $date: DateTime!) {
      engagement_update(input: $input) {
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
            const mutation = await graphQLClient().request(UpdateEngagementDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit_item", {
                  values: {
                    item: $_("engagement", { values: { n: 0 } }),
                    name: mutation.engagement_update.current?.person?.[0].name,
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
      values: { item: $_("engagement", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("engagement", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( EngagementAndFacetDocument, { uuid: $page.params.engagement, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to"), currentDate: $date } )}
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
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const engagement = data.engagements.objects[0].validities[0]}
  {@const facets = data.facets.objects}

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
            startValue={engagement.validity.to
              ? engagement.validity.to.split("T")[0]
              : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <Search
          type="org-unit"
          startValue={{
            uuid: engagement.org_unit[0].uuid,
            name: engagement.org_unit[0].name,
          }}
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          on:clear={() => ($orgUnit.value = "")}
          bind:value={selectedOrgUnit}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        <div class="flex flex-row gap-6">
          <Input
            title="ID"
            id="user-key"
            startValue={engagement.user_key}
            extra_classes="basis-1/2"
          />
          <Select
            title={capital($_("job_function", { values: { n: 1 } }))}
            id="job-function"
            startValue={engagement.job_function}
            bind:name={$jobFunction.value}
            errors={$jobFunction.errors}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("engagement_type"))}
            id="engagement-type"
            startValue={engagement.engagement_type}
            bind:name={$engagementType.value}
            errors={$engagementType.errors}
            iterable={getClassesByFacetUserKey(facets, "engagement_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title={capital($_("primary"))}
            id="primary"
            startValue={engagement.primary ? engagement.primary : undefined}
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
          $_("edit_item", {
            values: { item: $_("engagement", { values: { n: 1 } }) },
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
