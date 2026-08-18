<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import type { SubmitFunction } from "./$types"
  import { EngagementDocument, UpdateEngagementDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import type { FacetValidities } from "$lib/utils/classes"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { createQuery } from "$lib/http/query"
  import { getValidities } from "$lib/http/getValidities"
  import { getClasses } from "$lib/http/getClasses"

  import { env } from "$lib/env"
  import { normalizeEngagement } from "$lib/utils/normalizeForm"

  gql`
    query Engagement(
      $uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $currentDate: DateTime
    ) {
      engagements(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            engagement_type_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            job_function_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            primary_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            validity {
              from
              to
            }
            org_unit_response {
              uuid
              current(at: $currentDate) {
                name
              }
            }
            extension_1
            extension_4
          }
        }
      }
    }

    mutation UpdateEngagement($input: EngagementUpdateInput!, $date: DateTime!) {
      engagement_update(input: $input) {
        current(at: $date) {
          person_response {
            uuid
            current(at: $date) {
              name
            }
          }
        }
      }
    }
  `

  let startDate: string = $date
  let toDate: string
  let selectedOrgUnit: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const orgUnit = field("org_unit", "", [required()])
  const jobFunction = field("job_function", "", [required()])
  const engagementType = field("engagement_type", "", [required()])
  const userKey = field("user_key", "", [])
  const primary = field("primary", "", [])
  const svelteForm = form(
    fromDate,
    orgUnit,
    jobFunction,
    engagementType,
    userKey,
    primary
  )

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if (!$svelteForm.valid) return
      if (result.type !== "success" || !result.data) return

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
                name: mutation.engagement_update.current?.person_response?.current
                  ?.name,
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

  // Datepicker bounds for the selected org unit. A query rather than a bare
  // `.then` assignment: run() aborts the previous fetch, so a slow response
  // for an earlier selection cannot overwrite the bounds of the current one.
  const validities = createQuery<{
    from: string | undefined | null
    to: string | undefined | null
  }>({ from: null, to: null })
  $: if (selectedOrgUnit?.uuid) {
    const orgUnitUuid = selectedOrgUnit.uuid
    validities.run((signal) => getValidities(orgUnitUuid, signal))
  } else {
    // Reset via run() so any in-flight fetch is aborted, not just outraced.
    validities.run(async () => ({ from: null, to: null }))
  }

  // The facet selects must only offer options that are valid on the chosen
  // start date. They are disabled (see the template) when that cannot be
  // guaranteed: startDate is empty, or the facets fetch failed. Two gaps are
  // accepted deliberately:
  // - while a refetch is loading, the previous fetch's options stay pickable
  //   (disabling on `loading` would toggle the selects on every date keystroke)
  // - a failed fetch is only retried when startDate or the org unit changes;
  //   there is no retry button
  const facets = createQuery<FacetValidities[]>()
  // Only fetch when a start date is set: getClasses rejects a null date, and
  // the facet selects are disabled without one anyway.
  $: if (startDate) {
    facets.run((signal) =>
      getClasses(
        {
          currentDate: startDate,
          orgUuid: selectedOrgUnit?.uuid,
          facetUserKeys: ["engagement_type", "engagement_job_function", "primary_type"],
        },
        signal
      )
    )
  }

  // Created in the script (not inline in the {#await} tag) so the result can
  // be captured below without a side effect in the template.
  const engagementPromise = graphQLClient().request(EngagementDocument, {
    uuid: $page.params.engagement,
    fromDate: $page.url.searchParams.get("from"),
    toDate: $page.url.searchParams.get("to"),
    currentDate: startDate,
  })

  let initialEngagement: any = null
  engagementPromise.then(
    (data) => {
      initialEngagement = normalizeEngagement(data.engagements.objects[0].validities[0])
    },
    // The template's {#await} has no {:catch}, so a failed load stays on the
    // pending branch. This handler only prevents an unhandled rejection from
    // this second promise chain.
    () => {}
  )

  let hasChanges = false
  $: if (initialEngagement) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged =
      selectedOrgUnit?.uuid !== initialEngagement.org_unit ||
      $jobFunction.value !== initialEngagement.job_function ||
      $engagementType.value !== initialEngagement.engagement_type ||
      $userKey.value !== initialEngagement.user_key ||
      $primary.value !== initialEngagement.primary

    const toDateExtended =
      toDate === ""
        ? initialEngagement.to !== null
        : toDate > (initialEngagement.to ?? null)
    hasChanges = editableChanged || toDateExtended
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

{#await engagementPromise}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
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
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const engagement = data.engagements.objects[0].validities[0]}
  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={startDate}
            bind:validationValue={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={$validities.data?.from}
            max={toDate ? toDate : $validities.data?.to}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={engagement.validity.to
              ? engagement.validity.to.split("T")[0]
              : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : $validities.data?.from}
            max={$validities.data?.to}
          />
        </div>
        <Search
          type="org-unit"
          at={startDate}
          startValue={{
            uuid: engagement.org_unit_response.uuid,
            name: engagement.org_unit_response.current?.name ?? "",
          }}
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          on:clear={() => ($orgUnit.value = "")}
          bind:value={selectedOrgUnit}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        {#if $facets.loading && !$facets.data}
          <div class="flex flex-row gap-6">
            <Skeleton extra_classes="basis-1/2" />
            <Skeleton extra_classes="basis-1/2" />
          </div>
          <div class="flex flex-row gap-6">
            <Skeleton extra_classes="basis-1/2" />
            <Skeleton extra_classes="basis-1/2" />
          </div>
        {/if}
        {#if $facets.error}
          <p class="text-sm text-error">
            {capital($_($facets.data ? "load_error_options" : "load_error"))}
          </p>
        {/if}
        {#if $facets.data}
          <div class="flex flex-row gap-6">
            <Input
              title="ID"
              id="user-key"
              bind:value={$userKey.value}
              startValue={engagement.user_key}
              extra_classes="basis-1/2"
            />
            <Select
              title={env.PUBLIC_SHOW_EXTENSION_1
                ? capital($_("job_code"))
                : capital($_("job_function", { values: { n: 1 } }))}
              id="job-function"
              startValue={{
                uuid: engagement.job_function_response.uuid,
                name: engagement.job_function_response.current?.name ?? "",
              }}
              bind:name={$jobFunction.value}
              errors={$jobFunction.errors}
              iterable={filterClassesByFacetUserKey(
                $facets.data,
                "engagement_job_function"
              )}
              disabled={!startDate || $facets.error}
              extra_classes="basis-1/2"
              required={true}
            />
          </div>
          {#if env.PUBLIC_SHOW_EXTENSION_1 || env.PUBLIC_SHOW_EXTENSION_4}
            <div class="flex flex-row gap-6">
              {#if env.PUBLIC_SHOW_EXTENSION_1}
                <Input
                  title={capital($_("job_function", { values: { n: 1 } }))}
                  id="extension-1"
                  startValue={engagement.extension_1}
                  extra_classes="basis-1/2"
                />
              {/if}
              {#if env.PUBLIC_SHOW_EXTENSION_4}
                <Input
                  title={capital($_("department_code"))}
                  id="extension-4"
                  startValue={engagement.extension_4}
                  extra_classes="basis-1/2"
                />
              {/if}
            </div>
          {/if}
          <div class="flex flex-row gap-6">
            <Select
              title={capital($_("engagement_type"))}
              id="engagement-type"
              startValue={{
                uuid: engagement.engagement_type_response.uuid,
                name: engagement.engagement_type_response.current?.name ?? "",
              }}
              bind:name={$engagementType.value}
              errors={$engagementType.errors}
              iterable={filterClassesByFacetUserKey($facets.data, "engagement_type")}
              disabled={!startDate || $facets.error}
              extra_classes="basis-1/2"
              required={true}
            />
            <Select
              title={capital($_("primary"))}
              id="primary"
              bind:name={$primary.value}
              startValue={engagement.primary_response
                ? {
                    uuid: engagement.primary_response.uuid,
                    name: engagement.primary_response.current?.name ?? "",
                  }
                : undefined}
              iterable={filterClassesByFacetUserKey($facets.data, "primary_type")}
              disabled={!startDate || $facets.error}
              extra_classes="basis-1/2"
              on:clear={() => ($primary.value = "")}
              isClearable={true}
            />
          </div>
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("engagement", { values: { n: 1 } }) },
          })
        )}
        disabled={!hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/employee/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
