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
  import Search from "$lib/components/search/Search.svelte"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import OnboardingTab from "$lib/components/userflow/OnboardingTab.svelte"
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

  $: if (engagement.orgUnit?.uuid) {
    ;(async () => {
      validities = await getValidities(
        engagement.orgUnit ? engagement.orgUnit.uuid : ""
      )
    })()
  } else {
    validities = { from: null, to: null }
  }

  let selectedTab = 0

  $: engagement = $engagementInfo[selectedTab] ?? $engagementInfo[0]
</script>

<form
  on:submit|preventDefault={async () => {
    if (await engagementInfo.validateForm()) {
      step.updateStep("inc")
    }
  }}
>
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
      <OnboardingTab
        items={$engagementInfo}
        label="engagement"
        addItem={engagementInfo.addEngagement}
        removeItem={engagementInfo.removeEngagement}
        selectedIndex={selectedTab}
        setSelectedIndex={(i) => (selectedTab = i)}
      />
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={engagement.fromDate}
            errors={engagement.validated === false && !engagement.fromDate
              ? ["required"]
              : []}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={engagement.toDate ? engagement.toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={engagement.toDate}
            title={capital($_("date.end_date"))}
            id="to"
            min={engagement.fromDate ? engagement.fromDate : validities.from}
            max={validities.to}
          />
        </div>
        <Search
          type="org-unit"
          bind:value={engagement.orgUnit}
          errors={engagement.validated === false && !engagement.orgUnit?.uuid
            ? ["required"]
            : []}
          required={true}
        />
        <Breadcrumbs orgUnit={engagement.orgUnit} />
        <div class="flex flex-row gap-6">
          <Input
            title="ID"
            id="user-key"
            bind:value={engagement.userkey}
            extra_classes="basis-1/2"
          />
          <Select
            title={env.PUBLIC_SHOW_EXTENSION_1 === "true"
              ? capital($_("job_code"))
              : capital($_("job_function", { values: { n: 1 } }))}
            id="job-function"
            bind:value={engagement.jobFunction}
            errors={engagement.validated === false && !engagement.jobFunction?.uuid
              ? ["required"]
              : []}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
            required={true}
            extra_classes="basis-1/2"
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("engagement_type"))}
            id="engagement-type"
            bind:value={engagement.engagementType}
            errors={engagement.validated === false && !engagement.engagementType?.uuid
              ? ["required"]
              : []}
            iterable={getClassesByFacetUserKey(facets, "engagement_type")}
            required={true}
            extra_classes="basis-1/2"
          />
          <Select
            title={capital($_("primary"))}
            id="primary"
            bind:value={engagement.primary}
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
