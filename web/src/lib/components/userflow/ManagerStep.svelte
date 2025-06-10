<script lang="ts">
  import { step } from "$lib/stores/stepStore"
  import { managerInfo } from "$lib/stores/managerInfoStore"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import OnboardingFormButtons from "$lib/components/userflow/OnboardingFormButtons.svelte"
  import OnboardingTab from "$lib/components/userflow/OnboardingTab.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { ManagerFacetsDocument } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/getClasses"
  import Search from "$lib/components/search/Search.svelte"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import SelectMultiple from "$lib/components/forms/shared/SelectMultiple.svelte"
  import { getValidities } from "$lib/util/helpers"

  gql`
    query ManagerFacets($currentDate: DateTime!) {
      facets(
        filter: { user_keys: ["manager_type", "manager_level", "responsibility"] }
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

  $: if (manager.orgUnit?.uuid) {
    ;(async () => {
      validities = await getValidities(manager.orgUnit ? manager.orgUnit.uuid : "")
    })()
  } else {
    validities = { from: null, to: null }
  }

  let selectedTab = 0

  $: manager = $managerInfo[selectedTab] ?? $managerInfo[0]
</script>

<form
  on:submit|preventDefault={async () => {
    if (await managerInfo.validateForm()) {
      step.updateStep("inc")
    }
  }}
>
  {#await graphQLClient().request(ManagerFacetsDocument, { currentDate: $date })}
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
        <Skeleton />
      </div>
    </div>
  {:then data}
    {@const facets = data.facets.objects}

    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <OnboardingTab
        items={$managerInfo}
        label="manager"
        addItem={managerInfo.addManager}
        removeItem={managerInfo.removeManager}
        selectedIndex={selectedTab}
        setSelectedIndex={(i) => (selectedTab = i)}
      />
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={manager.fromDate}
            errors={manager.validated === false && !manager.fromDate
              ? ["required"]
              : []}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={manager.toDate ? manager.toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={manager.toDate}
            title={capital($_("date.end_date"))}
            id="to"
            min={manager.fromDate ? manager.fromDate : validities.from}
            max={validities.to}
          />
        </div>
        <Search
          type="org-unit"
          bind:value={manager.orgUnit}
          on:clear={() => (manager.orgUnit = undefined)}
          errors={manager.validated === false && !manager.orgUnit?.uuid
            ? ["required"]
            : []}
          required={true}
        />
        <Breadcrumbs orgUnit={manager.orgUnit} />
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("manager_type"))}
            id="manager-type"
            bind:value={manager.managerType}
            errors={manager.validated === false && !manager.managerType?.uuid
              ? ["required"]
              : []}
            iterable={getClassesByFacetUserKey(facets, "manager_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title={capital($_("manager_level"))}
            id="manager-level"
            bind:value={manager.managerLevel}
            errors={manager.validated === false && !manager.managerLevel?.uuid
              ? ["required"]
              : []}
            iterable={getClassesByFacetUserKey(facets, "manager_level")}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <SelectMultiple
          bind:value={manager.responsibilities}
          errors={manager.validated === false && !manager.responsibilities.length
            ? ["required"]
            : []}
          on:clear={() => (manager.responsibilities = [])}
          title={capital($_("manager_responsibility"))}
          id="responsibility"
          iterable={getClassesByFacetUserKey(facets, "responsibility")}
          required={true}
        />
      </div>
    </div>
    <OnboardingFormButtons />
    <Error />
  {/await}
</form>
