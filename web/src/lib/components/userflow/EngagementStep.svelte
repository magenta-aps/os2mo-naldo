<script lang="ts">
  import { step } from "$lib/stores/stepStore"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import OnboardingFormButtons from "$lib/components/userflow/OnboardingFormButtons.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { EngagementFacetsDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/getClasses"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Search from "$lib/components/search/Search.svelte"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getValidities } from "$lib/util/helpers"
  import { env } from "$env/dynamic/public"

  gql`
    query EngagementFacets($currentDate: DateTime!) {
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
    }
  `

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  $: if ($engagementInfo.orgUnit?.uuid) {
    ;(async () => {
      validities = await getValidities(
        $engagementInfo.orgUnit ? $engagementInfo.orgUnit.uuid : ""
      )
    })()
  } else {
    validities = { from: null, to: null }
  }

  const fromDate = field("from", "", [required()])
  const orgUnit = field("org_unit", "", [required()])
  const jobFunction = field("job_function", "", [required()])
  const engagementType = field("engagement_type", "", [required()])
  const svelteForm = form(fromDate, orgUnit, jobFunction, engagementType)

  const validateForm = async () => {
    await svelteForm.validate()
    if ($svelteForm.valid) {
      engagementInfo.isValid(true)
      step.updateStep("inc")
    } else {
      engagementInfo.isValid(false)
    }
  }
</script>

<form on:submit|preventDefault={async () => await validateForm()}>
  {#await graphQLClient().request(EngagementFacetsDocument, { currentDate: $date })}
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
  {:then data}
    {@const facets = data.facets.objects}

    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$engagementInfo.fromDate}
            bind:validationValue={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={$engagementInfo.toDate ? $engagementInfo.toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={$engagementInfo.toDate}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <Search
          type="org-unit"
          bind:value={$engagementInfo.orgUnit}
          on:clear={() => ($orgUnit.value = "")}
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          required={true}
        />
        <Breadcrumbs orgUnit={$engagementInfo.orgUnit} />
        <div class="flex flex-row gap-6">
          <Input
            title="ID"
            id="user-key"
            bind:value={$engagementInfo.userkey}
            extra_classes="basis-1/2"
          />
          <Select
            title={env.PUBLIC_SHOW_EXTENSION_1 === "true"
              ? capital($_("job_code"))
              : capital($_("job_function", { values: { n: 1 } }))}
            id="job-function"
            bind:value={$engagementInfo.jobFunction}
            bind:name={$jobFunction.value}
            errors={$jobFunction.errors}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
            required={true}
            extra_classes="basis-1/2"
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("engagement_type"))}
            id="engagement-type"
            bind:value={$engagementInfo.engagementType}
            bind:name={$engagementType.value}
            errors={$engagementType.errors}
            iterable={getClassesByFacetUserKey(facets, "engagement_type")}
            required={true}
            extra_classes="basis-1/2"
          />
          <Select
            title={capital($_("primary"))}
            id="primary"
            bind:value={$engagementInfo.primary}
            iterable={getClassesByFacetUserKey(facets, "primary_type")}
            extra_classes="basis-1/2"
            isClearable={true}
          />
        </div>
      </div>
    </div>
    <OnboardingFormButtons />
    <Error />
  {/await}
</form>
