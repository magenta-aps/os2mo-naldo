<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import ItUserStepSelect from "$lib/components/forms/shared/ItUserStepSelect.svelte"
  import CircleButton from "$lib/components/shared/CircleButton.svelte"
  import OnboardingFormButtons from "$lib/components/userflow/OnboardingFormButtons.svelte"
  import { step } from "$lib/stores/stepStore"
  import { graphQLClient } from "$lib/http/client"
  import { ItSystemsDocument, GetItSystemRolesDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { FacetValidities } from "$lib/utils/classes"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { formatITSystemNames, type UnpackedClass } from "$lib/utils/helpers"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import { getPrimaryClasses } from "$lib/http/getClasses"
  import { getPersonValidities } from "$lib/http/getValidities"
  import OnboardingTab from "$lib/components/userflow/OnboardingTab.svelte"
  import removeRounded from "@iconify/icons-material-symbols/remove-rounded"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"
  import { onMount } from "svelte"

  gql`
    query ItSystems($currentDate: DateTime!) {
      itsystems {
        objects {
          current(at: $currentDate) {
            name
            uuid
          }
        }
      }
    }
    query GetITSystemRoles($itSystemUuid: [UUID!], $currentDate: DateTime!) {
      classes(
        filter: {
          facet: { user_keys: "role" }
          it_system: { uuids: $itSystemUuid }
          from_date: $currentDate
        }
      ) {
        objects {
          validities {
            uuid
            user_key
            name
          }
        }
      }
    }
  `

  let startDate: string = $date
  let selectedTab = 0

  let itSystemRoles: UnpackedClass | undefined

  const fetchItSystemRoles = async (itSystemUuid: string | undefined | null) => {
    const res = await graphQLClient().request(GetItSystemRolesDocument, {
      itSystemUuid: itSystemUuid,
      currentDate: $date,
    })
    itSystemRoles = res.classes?.objects
      .map((cls) => cls.validities[0])
      .sort((a, b) => (a.name > b.name ? 1 : -1))
  }

  onMount(async () => {
    if (ituser.itSystem?.uuid) {
      fetchItSystemRoles(ituser.itSystem.uuid)
    }
  })

  $: ituser = $ituserInfo[selectedTab] ?? $ituserInfo[0]
  // Make sure we fetch itsystem roles when changing tabs
  let lastFetched: string
  $: if (ituser && !!ituser.itSystem?.uuid && ituser.itSystem?.uuid !== lastFetched) {
    lastFetched = ituser.itSystem?.uuid
    fetchItSystemRoles(ituser.itSystem.uuid)
  }

  let facets: FacetValidities[]
  let abortController: AbortController

  $: {
    // Abort the previous request if a new one is about to start
    if (abortController) abortController.abort()
    abortController = new AbortController()

    // Make sure `currentDate` isn't sent if startDate is null.
    const params = {
      fromDate: startDate,
      primaryClass: env.PUBLIC_PRIMARY_CLASS_USER_KEY,
    }

    ;(async () => {
      try {
        facets = await getPrimaryClasses(params, abortController.signal)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err)
        }
      }
    })()
  }
</script>

<form
  on:submit|preventDefault={async () => {
    if (await ituserInfo.validateForm()) {
      step.updateStep("inc")
    }
  }}
>
  {#await graphQLClient().request( ItSystemsDocument, { uuid: $page.params.uuid, currentDate: $date } )}
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  {:then data}
    {@const itSystems = data.itsystems.objects}
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <OnboardingTab
        items={$ituserInfo}
        label="ituser"
        addItem={ituserInfo.addItuser}
        removeItem={ituserInfo.removeItuser}
        selectedIndex={selectedTab}
        setSelectedIndex={(i) => (selectedTab = i)}
      />
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={ituser.fromDate ? ituser.fromDate : $date}
            bind:value={ituser.fromDate}
            bind:validationValue={startDate}
            errors={ituser.validated === false && !ituser.fromDate ? ["required"] : []}
            title={capital($_("date.start_date"))}
            id="from"
            required={true}
          />
          <DateInput
            bind:value={ituser.toDate}
            title={capital($_("date.end_date"))}
            id="to"
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("it_system"))}
            id="it-system"
            bind:value={ituser.itSystem}
            errors={ituser.validated === false && !ituser.itSystem?.uuid
              ? ["required"]
              : []}
            on:change={() => {
              fetchItSystemRoles(ituser.itSystem.uuid)
            }}
            iterable={formatITSystemNames(itSystems)}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            bind:value={ituser.userkey}
            errors={ituser.validated === false && !ituser.userkey ? ["required"] : []}
            extra_classes="basis-1/2"
            title={capital($_("account_name"))}
            id="account-name"
            required={true}
            disabled={env.PUBLIC_SKATTESTYRELSEN_USERFLOW}
          />
        </div>
        {#if facets}
          <Select
            title={capital($_("primary"))}
            id="primary"
            bind:value={ituser.primary}
            iterable={filterClassesByFacetUserKey(facets, "primary_type")}
            isClearable={true}
          />
        {/if}
        <TextArea title={capital($_("notes"))} id="notes" bind:value={ituser.notes} />
        <div class="divider p-0 m-0 mb-4 w-full" />
        <h4>{capital($_("rolebinding", { values: { n: 2 } }))}</h4>
        {#each ituser.rolebindings as rolebinding, rolebindingIndex}
          {#if itSystemRoles && itSystemRoles.length}
            <ItUserStepSelect
              title={capital($_("role", { values: { n: 1 } }))}
              id="it-system-role-uuid"
              bind:value={ituser.rolebindings[rolebindingIndex].role}
              iterable={itSystemRoles}
            />
          {:else}
            <Select
              title={capital($_("role", { values: { n: 1 } }))}
              id="it-system-role-uuid"
              extra_classes="basis-1/2"
              disabled
            />
          {/if}
          {#if ituser.rolebindings.length > 1}
            <CircleButton
              on:click={() => {
                ituserInfo.removeRolebinding(selectedTab, rolebindingIndex)
              }}
              icon={removeRounded}
            />
          {/if}
        {/each}

        <CircleButton
          on:click={() => {
            ituserInfo.addRolebinding(selectedTab)
          }}
          icon={addRounded}
          extraClasses="mb-4"
        />

        <div class="divider p-0 m-0 my-2 w-full" />
      </div>
    </div>
    <OnboardingFormButtons />
    <Error />
  {/await}
</form>
