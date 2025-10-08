<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import CircleButton from "$lib/components/shared/CircleButton.svelte"
  import OnboardingFormButtons from "$lib/components/userflow/OnboardingFormButtons.svelte"
  import { step } from "$lib/stores/stepStore"
  import { graphQLClient } from "$lib/http/client"
  import {
    ItSystemsAndPrimaryDocument,
    GetItSystemRolesDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassByUserKey } from "$lib/utils/classes"
  import { formatITSystemNames, type UnpackedClass } from "$lib/utils/helpers"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import { env } from "$lib/env"
  import ItuserCheckbox from "$lib/components/userflow/ItuserCheckbox.svelte"
  import OnboardingTab from "$lib/components/userflow/OnboardingTab.svelte"
  import Icon from "@iconify/svelte"
  import removeRounded from "@iconify/icons-material-symbols/remove-rounded"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"
  import { onMount } from "svelte"

  gql`
    query ItSystemsAndPrimary($primaryClass: String!, $currentDate: DateTime!) {
      itsystems {
        objects {
          current(at: $currentDate) {
            name
            uuid
          }
        }
      }
      classes(
        filter: { user_keys: [$primaryClass, "non-primary"], from_date: $currentDate }
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
</script>

<form
  on:submit|preventDefault={async () => {
    if (await ituserInfo.validateForm()) {
      step.updateStep("inc")
    }
  }}
>
  {#await graphQLClient().request( ItSystemsAndPrimaryDocument, { uuid: $page.params.uuid, primaryClass: env.PUBLIC_PRIMARY_CLASS_USER_KEY, currentDate: $date } )}
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
      </div>
    </div>
  {:then data}
    {@const itSystems = data.itsystems.objects}
    {@const classes = data.classes.objects}
    {@const primaryClass = filterClassByUserKey(
      classes,
      env.PUBLIC_PRIMARY_CLASS_USER_KEY
    )}
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
          />
        </div>
        <div class="flex">
          <ItuserCheckbox
            id="primary"
            title={capital($_("primary"))}
            checked={ituser.primary.uuid === primaryClass.uuid}
            on:change={(e) => {
              if (e.target instanceof HTMLInputElement)
                ituser.primary = e.target.checked
                  ? primaryClass
                  : filterClassByUserKey(classes, "non-primary")
            }}
          />
        </div>
        <TextArea title={capital($_("notes"))} id="notes" bind:value={ituser.notes} />
        <div class="divider p-0 m-0 mb-4 w-full" />
        <h4>{capital($_("rolebinding", { values: { n: 2 } }))}</h4>
        {#each ituser.rolebindings as rolebinding, rolebindingIndex}
          {#if itSystemRoles && itSystemRoles.length}
            {#key itSystemRoles}
              <Select
                title={capital($_("role", { values: { n: 1 } }))}
                id="it-system-role-uuid"
                bind:value={rolebinding.role}
                iterable={itSystemRoles}
                errors={rolebinding.validated === false ? ["required"] : []}
              />
            {/key}
          {:else}
            <Select
              title={capital($_("role", { values: { n: 1 } }))}
              id="it-system-role-uuid"
              extra_classes="basis-1/2"
              disabled
            />
          {/if}
          <CircleButton
            on:click={() => {
              ituserInfo.removeRolebinding(selectedTab, rolebindingIndex)
            }}
            icon={removeRounded}
          />
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
