<script lang="ts">
  import { step } from "$lib/stores/stepStore"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { FacetsDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/Search.svelte"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities } from "$lib/util/helpers"

  gql`
    query Facets($currentDate: DateTime!) {
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
</script>

<form on:submit|preventDefault={() => step.updateStep("inc")} class="form-step">
  {#await graphQLClient().request(FacetsDocument, { currentDate: $date })}
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

    <form on:submit|preventDefault={() => step.updateStep("inc")} class="mx-6">
      <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
        <div class="p-8">
          <div class="flex flex-row gap-6">
            <!-- TODO: dynamically change dates depending on which org has been chosen -->
            <DateInput
              startValue={$date}
              bind:value={$engagementInfo.fromDate}
              title={capital($_("date.start_date"))}
              id="from"
              required={true}
            />
            <DateInput
              bind:value={$engagementInfo.toDate}
              title={capital($_("date.end_date"))}
              id="to"
            />
          </div>
          <Search
            type="org-unit"
            on:clear={() => ($engagementInfo.orgUnit = { uuid: "", name: "" })}
            bind:value={$engagementInfo.orgUnit}
            required={true}
          />
          <Breadcrumbs orgUnit={$engagementInfo.orgUnit} />
          <div class="flex flex-row gap-6">
            <Input title="ID" id="user-key" extra_classes="basis-1/2" />
            <Select
              title={capital($_("job_function", { values: { n: 1 } }))}
              id="job-function"
              bind:value={$engagementInfo.jobFunction}
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
              iterable={getClassesByFacetUserKey(facets, "engagement_type")}
              required={true}
              extra_classes="basis-1/2"
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
          >{capital($_("next"))}</button
        >
        <button
          type="button"
          class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
          on:click={() => step.updateStep("dec")}
        >
          {capital($_("back"))}
        </button>
      </div>
      <Error />
    </form>
  {/await}
</form>
