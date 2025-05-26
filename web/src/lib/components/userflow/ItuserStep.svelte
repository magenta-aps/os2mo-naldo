<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import {
    ituserInfo,
    createDefaultItUser,
    createDefaultRolebinding,
    validateRolebinding,
  } from "$lib/stores/ituserInfoStore"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import CircleButton from "$lib/components/shared/CircleButton.svelte"
  import OnboardingFormButtons from "$lib/components/userflow/OnboardingFormButtons.svelte"
  import { step } from "$lib/stores/stepStore"
  import { graphQLClient } from "$lib/util/http"
  import {
    ItSystemsAndPrimaryDocument,
    GetItSystemRolesDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassByUserKey } from "$lib/util/getClasses"
  import { getITSystemNames, type UnpackedClass } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import { env } from "$env/dynamic/public"
  import ItUserCheckbox from "./ItUserCheckbox.svelte"
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

  const fromDate = field("from", "", [required()])
  const itSystemField = field("it_system", "", [required()])
  const accountName = field("accountName", "", [required()])
  const svelteForm = form(fromDate, itSystemField, accountName)
  let selectedTab = 0

  const validateForm = async () => {
    await svelteForm.validate()
    const ituserValid = $svelteForm.valid
    let rolebindingsValid = true
    if (ituserValid) {
      // Update rolebindings and validate
      ituserInfo.update((users) =>
        users.map((user) => {
          const updatedRolebindings = user.rolebindings.map((rb) => {
            const filled = Boolean(rb.role?.uuid)
            const isValid = filled ? validateRolebinding(rb) : false
            if (filled && !isValid) rolebindingsValid = false
            return { ...rb, validated: isValid }
          })
          return { ...user, rolebindings: updatedRolebindings }
        })
      )
    }

    if (ituserValid && rolebindingsValid) {
      ituserInfo.isValid(true)
      step.updateStep("inc")
    } else {
      ituserInfo.isValid(false)
    }
  }

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
  const addItUser = () => {
    ituserInfo.update((users) => [...users, createDefaultItUser()])
    selectedTab = $ituserInfo.length - 1
  }

  const removeItUser = (index: number) => {
    ituserInfo.update((users) => {
      const updated = users.filter((_, i) => i !== index)
      if (selectedTab >= updated.length) {
        selectedTab = Math.max(0, updated.length - 1)
      }
      return updated
    })
  }

  const addRolebinding = (itUserIndex: number) => {
    ituserInfo.update((users) => {
      return users.map((user, i) => {
        if (i === itUserIndex) {
          return {
            ...user,
            rolebindings: [...user.rolebindings, createDefaultRolebinding()],
          }
        }
        return user
      })
    })
  }

  const removeRolebinding = (itUserIndex: number, rolebindingIndex: number) => {
    ituserInfo.update((users) => {
      return users.map((user, i) => {
        if (i === itUserIndex) {
          const updatedRolebindings = user.rolebindings.filter(
            (_, j) => j !== rolebindingIndex
          )
          return {
            ...user,
            rolebindings: updatedRolebindings,
          }
        }
        return user
      })
    })
  }

  onMount(async () => {
    if (ituser.itSystem?.uuid) {
      fetchItSystemRoles(ituser.itSystem.uuid)
    }
  })

  $: ituser = $ituserInfo[selectedTab]
</script>

<form on:submit|preventDefault={async () => await validateForm()}>
  {#await graphQLClient().request( ItSystemsAndPrimaryDocument, { uuid: $page.params.uuid, primaryClass: env.PUBLIC_PRIMARY_CLASS_USER_KEY || "primary", currentDate: $date } )}
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
    {@const primaryClass = getClassByUserKey(
      classes,
      env.PUBLIC_PRIMARY_CLASS_USER_KEY || "primary"
    )}
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="tabs tabs-lifted mb-4 flex flex-wrap">
        {#each $ituserInfo as _ituser, ituserIndex}
          <button
            class="tab flex gap-2 cursor-pointer [--tab-border-color:transparent]"
            class:tab-active={selectedTab === ituserIndex}
            class:[--tab-bg:bg-slate-100]={selectedTab === ituserIndex}
            class:bg-white={selectedTab !== ituserIndex}
            on:click={(e) => {
              e.preventDefault()
              e.stopPropagation()
              selectedTab = ituserIndex
            }}
          >
            <span>{capital($_("ituser", { values: { n: 1 } }))} {ituserIndex + 1}</span>
            <button
              class="btn btn-xs btn-circle btn-ghost text-secondary hover:bg-error"
              type="button"
              on:click={(e) => {
                e.preventDefault()
                e.stopPropagation()
                removeItUser(ituserIndex)
              }}
              aria-label="Close IT-user tab"
            >
              <Icon
                icon="material-symbols:close-small-outline-rounded"
                width="20"
                height="20"
              />
            </button>
          </button>
        {/each}

        <button
          class="btn btn-sm btn-ghost px-2"
          on:click={addItUser}
          aria-label="Add IT-user"
        >
          <Icon icon={addRounded} width="20" height="20" />
        </button>
      </div>
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={ituser.fromDate}
            bind:validationValue={$fromDate.value}
            errors={$fromDate.errors}
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
            bind:name={$itSystemField.value}
            errors={$itSystemField.errors}
            on:change={() => {
              fetchItSystemRoles(ituser.itSystem.uuid)
            }}
            iterable={getITSystemNames(itSystems)}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            bind:value={ituser.userkey}
            bind:cprName={$accountName.value}
            errors={$accountName.errors}
            extra_classes="basis-1/2"
            title={capital($_("account_name"))}
            id="account-name"
            required={true}
          />
        </div>
        <div class="flex">
          <ItUserCheckbox
            id="primary"
            title={capital($_("primary"))}
            startValue={ituser.primary.uuid}
            value={primaryClass.uuid}
            on:change={() => {
              if (ituser.primary.uuid !== primaryClass.uuid) {
                ituser.primary = primaryClass
              } else {
                ituser.primary = getClassByUserKey(classes, "non-primary")
              }
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
                errors={rolebinding.validated ? [] : ["required"]}
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
              removeRolebinding(selectedTab, rolebindingIndex)
            }}
            icon={removeRounded}
          />
        {/each}

        <CircleButton
          on:click={() => {
            addRolebinding(selectedTab)
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
