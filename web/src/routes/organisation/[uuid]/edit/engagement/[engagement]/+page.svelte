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
  import type { FacetValidities } from "$lib/utils/classes"
  import type { SubmitFunction } from "./$types"
  import { EngagementDocument, UpdateEngagementDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getValidities } from "$lib/http/getValidities"
  import { getClasses } from "$lib/http/getClasses"
  import { findClosestValidity } from "$lib/utils/validities"
  import { env } from "$lib/env"
  import { normalizeEngagement } from "$lib/utils/normalizeForm"

  gql`
    query Engagement($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      engagements(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            person(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              name
            }
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
            org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
              uuid
              name
              validity {
                from
                to
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
          person {
            name
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
                name: mutation.engagement_update.current?.person?.[0].name,
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

  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  let facets: FacetValidities[]
  let abortController: AbortController
  $: {
    // Abort the previous request if a new one is about to start
    if (abortController) abortController.abort()
    abortController = new AbortController()

    const params = {
      currentDate: startDate,
      orgUuid: selectedOrgUnit?.uuid,
      facetUserKeys: ["engagement_type", "engagement_job_function", "primary_type"],
    }

    ;(async () => {
      validities = selectedOrgUnit
        ? await getValidities(selectedOrgUnit.uuid)
        : { from: null, to: null }
      try {
        facets = await getClasses(params, abortController.signal)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err)
        }
      }
    })()
  }

  let initialEngagement: any = null
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

<!-- TODO: Fix formatting :yikes: -->
{#await graphQLClient().request( EngagementDocument, { uuid: $page.params.engagement, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to"), currentDate: $date } )}
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
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const engagement = data.engagements.objects[0].validities[0]}
  {#if !initialEngagement}
    {@html (() => {
      initialEngagement = normalizeEngagement(engagement)
      return ""
    })()}
  {/if}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={startDate}
            bind:validationValue={$fromDate.value}
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
            uuid: findClosestValidity(engagement.org_unit, $date).uuid,
            name: findClosestValidity(engagement.org_unit, $date).name,
          }}
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          on:clear={() => ($orgUnit.value = "")}
          bind:value={selectedOrgUnit}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        {#if facets}
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
              startValue={engagement.job_function}
              bind:name={$jobFunction.value}
              errors={$jobFunction.errors}
              iterable={filterClassesByFacetUserKey(facets, "engagement_job_function")}
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
              startValue={engagement.engagement_type}
              bind:name={$engagementType.value}
              errors={$engagementType.errors}
              iterable={filterClassesByFacetUserKey(facets, "engagement_type")}
              extra_classes="basis-1/2"
              required={true}
            />
            <Select
              title={capital($_("primary"))}
              id="primary"
              bind:name={$primary.value}
              startValue={engagement.primary ? engagement.primary : undefined}
              iterable={filterClassesByFacetUserKey(facets, "primary_type")}
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
        href="{base}/organisation/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
