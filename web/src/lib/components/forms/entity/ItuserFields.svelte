<script lang="ts">
  import { _ } from "svelte-i18n"
  import { get } from "svelte/store"
  import { capital, formatITSystemNames } from "$lib/utils/helpers"
  import type { UnpackedClass } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/http/client"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import CircleButton from "$lib/components/shared/CircleButton.svelte"
  import removeRounded from "@iconify/icons-material-symbols/remove-rounded"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import type { FacetValidities } from "$lib/utils/classes"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { createQuery } from "$lib/http/query"
  import { getPrimaryClasses } from "$lib/http/getClasses"
  import { getPersonValidities } from "$lib/http/getValidities"
  import { ItSystemsDocument, GetItSystemRolesDocument } from "./query.generated"
  import {
    createDefaultRolebindingValues,
    type ClassValue,
    type ItuserValues,
  } from "$lib/components/forms/entity/types"

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
          objects {
            uuid
            user_key
            name
          }
        }
      }
    }
  `

  // Shared by the ituser create route and the userflow wizard; see types.ts.
  export let value: ItuserValues
  // Route-only: the wizard's person does not exist yet, so its bounds stay open.
  export let personUuid: string | undefined = undefined
  // De-duplicates DOM ids when several instances are mounted (wizard tabs).
  export let idPrefix = ""

  // Captured at mount, so a route user typing the same string never locks the
  // input. A disabled input would also drop out of the route's formData.
  const lockedAccountName =
    !!env.PUBLIC_SKATTESTYRELSEN_USERFLOW && value.user_key === "nanoq-brugernavn"

  // Seeded from the bound value: validation must not wait for the gated select
  // to sync its name after the systems load.
  const fromDateField = field("from", "", [required()])
  const itSystemField = field("it_system", value.itSystem?.name ?? "", [required()])
  const accountNameField = field("account_name", value.user_key, [required()])
  const svelteForm = form(fromDateField, itSystemField, accountNameField)

  export const validate = async (): Promise<boolean> => {
    await svelteForm.validate()
    return get(svelteForm).valid
  }

  // Projected to primitives so unrelated keystrokes don't refire the blocks below.
  $: fromDate = value.fromDate
  $: itSystemUuid = value.itSystem?.uuid

  const itSystems = createQuery<ClassValue[] | undefined>()
  $: if (fromDate) {
    const currentDate = fromDate
    itSystems.run(async (signal) => {
      const res = await graphQLClient(signal).request(ItSystemsDocument, {
        currentDate: currentDate,
      })
      return formatITSystemNames(res.itsystems.objects)
    })
  }

  // Scoped to the IT user's start date: a role not yet valid then cannot be
  // bound. A query, so switching systems quickly cannot apply a stale list.
  const itSystemRoles = createQuery<UnpackedClass | undefined>()
  $: if (itSystemUuid && fromDate) {
    const uuid = itSystemUuid
    const currentDate = fromDate
    itSystemRoles.run(async (signal) => {
      const res = await graphQLClient(signal).request(GetItSystemRolesDocument, {
        itSystemUuid: uuid,
        currentDate: currentDate,
      })
      return res.classes?.objects
        .map((cls) => cls.objects[0])
        .sort((a, b) => (a.name > b.name ? 1 : -1))
    })
  } else {
    itSystemRoles.run(async () => [])
  }

  // TODO: once ITUsers link to engagements, these bounds need to come from
  // engagement -> org_unit validities instead.
  const validities = createQuery<{
    from: string | undefined | null
    to: string | undefined | null
  }>({ from: null, to: null })
  $: if (personUuid) {
    const uuid = personUuid
    validities.run((signal) => getPersonValidities(uuid, signal))
  } else {
    validities.run(async () => ({ from: null, to: null }))
  }

  const facets = createQuery<FacetValidities[]>()
  // Only fetch when a start date is set: the query rejects a null date, and
  // the primary select is disabled without one anyway.
  $: if (fromDate) {
    facets.run((signal) =>
      getPrimaryClasses(
        {
          fromDate: fromDate,
          primaryClass: env.PUBLIC_PRIMARY_CLASS_USER_KEY,
        },
        signal
      )
    )
  }

  const addRolebinding = () => {
    value.rolebindings = [...value.rolebindings, createDefaultRolebindingValues()]
  }
  const removeRolebinding = (index: number) => {
    value.rolebindings = value.rolebindings.filter((_, i) => i !== index)
  }
</script>

<div class="flex flex-row gap-6">
  <DateInput
    bind:value={value.fromDate}
    bind:validationValue={$fromDateField.value}
    errors={$fromDateField.errors}
    title={capital($_("date.start_date"))}
    id="{idPrefix}from"
    min={$validities.data?.from}
    max={value.toDate ? value.toDate : $validities.data?.to}
    required={true}
  />
  <DateInput
    bind:value={value.toDate}
    title={capital($_("date.end_date"))}
    id="{idPrefix}to"
    min={$fromDateField.value ? $fromDateField.value : $validities.data?.from}
    max={$validities.data?.to}
  />
</div>
{#if $itSystems.loading && !$itSystems.data}
  <div class="flex flex-row gap-6">
    <Skeleton extra_classes="basis-1/2" />
    <Skeleton extra_classes="basis-1/2" />
  </div>
{/if}
{#if $itSystems.error}
  <p class="text-sm text-error">
    {capital($_($itSystems.data?.length ? "load_error_options" : "load_error"))}
  </p>
{/if}
{#if $itSystems.data}
  <div class="flex flex-row gap-6">
    <Select
      title={capital($_("it_system"))}
      id="{idPrefix}it-system"
      bind:name={$itSystemField.value}
      bind:value={value.itSystem}
      errors={$itSystemField.errors}
      on:change={() => {
        // Roles belong to an IT system, so switching system invalidates the
        // chosen roles, but not the rows the user added.
        value.rolebindings = value.rolebindings.map(() =>
          createDefaultRolebindingValues()
        )
      }}
      iterable={$itSystems.data}
      extra_classes="basis-1/2"
      required={true}
    />
    <Input
      bind:value={value.user_key}
      bind:cprName={$accountNameField.value}
      errors={$accountNameField.errors}
      extra_classes="basis-1/2"
      title={capital($_("account_name"))}
      id="{idPrefix}account-name"
      disabled={lockedAccountName}
      required={true}
    />
  </div>
{/if}
{#if $facets.loading && !$facets.data}
  <Skeleton />
{/if}
{#if $facets.error}
  <p class="text-sm text-error">
    {capital($_($facets.data ? "load_error_options" : "load_error"))}
  </p>
{/if}
{#if $facets.data}
  <Select
    title={capital($_("primary"))}
    id="{idPrefix}primary"
    bind:value={value.primary}
    iterable={filterClassesByFacetUserKey($facets.data, "primary_type")}
    disabled={!value.fromDate || $facets.error}
    isClearable={true}
  />
{/if}
<Input
  title={capital($_("external_id"))}
  id="{idPrefix}external-id"
  bind:value={value.externalId}
/>
<TextArea title={capital($_("notes"))} id="{idPrefix}notes" bind:value={value.notes} />
<div class="divider p-0 m-0 mb-4 w-full" />
<h4>{capital($_("rolebinding", { values: { n: 2 } }))}</h4>
{#if $itSystemRoles.error}
  <p class="text-sm text-error">
    {capital($_($itSystemRoles.data?.length ? "load_error_options" : "load_error"))}
  </p>
{/if}
{#each value.rolebindings as rolebinding, index}
  {@const isLast = index === value.rolebindings.length - 1}
  {#if $itSystemRoles.data?.length}
    {#key $itSystemRoles.data}
      <Select
        title={capital($_("role", { values: { n: 1 } }))}
        bind:value={rolebinding.role}
        id="{idPrefix}it-system-role-uuid"
        iterable={$itSystemRoles.data}
        extra_classes="basis-1/2"
      />
    {/key}
  {:else}
    <Select
      title={capital($_("role", { values: { n: 1 } }))}
      id="{idPrefix}it-system-role-uuid"
      extra_classes="basis-1/2"
      disabled
    />
  {/if}
  <div class="flex items-center gap-2" class:mb-4={isLast}>
    {#if value.rolebindings.length > 1}
      <CircleButton
        on:click={() => {
          removeRolebinding(index)
        }}
        icon={removeRounded}
      />
    {/if}
    {#if isLast}
      <CircleButton on:click={() => addRolebinding()} icon={addRounded} />
    {/if}
  </div>
  {#if !isLast}
    <div class="divider p-0 m-0 my-2 w-full" />
  {/if}
{/each}
