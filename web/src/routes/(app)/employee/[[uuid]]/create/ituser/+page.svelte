<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import CircleButton from "$lib/components/shared/CircleButton.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import type { RoleBindingCreateInput } from "$lib/graphql/types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import {
    ItSystemsDocument,
    CreateItUserDocument,
    CreateItUserAndRolebindingDocument,
    GetItSystemRolesDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { FacetValidities } from "$lib/utils/classes"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { formatITSystemNames, type UnpackedClass } from "$lib/utils/helpers"
  import { createQuery } from "$lib/http/query"
  import { getPrimaryClasses } from "$lib/http/getClasses"
  import { getPersonValidities } from "$lib/http/getValidities"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import removeRounded from "@iconify/icons-material-symbols/remove-rounded"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"

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
    query GetITSystemRoles($itSystemUuid: [UUID!]) {
      classes(
        filter: { facet: { user_keys: "role" }, it_system: { uuids: $itSystemUuid } }
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

    mutation CreateItUserAndRolebinding(
      $itUserInput: ITUserCreateInput!
      $rolebindingInput: [RoleBindingCreateInput!]!
      $date: DateTime!
    ) {
      ituser_create(input: $itUserInput) {
        current(at: $date) {
          uuid
          person_response {
            uuid
            current(at: $date) {
              name
            }
          }
          itsystem_response {
            uuid
            current(at: $date) {
              name
            }
          }
        }
      }
      rolebindings_create(input: $rolebindingInput) {
        uuid
      }
    }
    mutation CreateItUser($itUserInput: ITUserCreateInput!, $date: DateTime!) {
      ituser_create(input: $itUserInput) {
        current(at: $date) {
          uuid
          person_response {
            uuid
            current(at: $date) {
              name
            }
          }
          itsystem_response {
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

  const fromDate = field("from", "", [required()])
  const itSystemField = field("it_system", "", [required()])
  const accountName = field("accountName", "", [required()])
  const svelteForm = form(fromDate, itSystemField, accountName)

  let itSystem: {
    uuid: string
    name: string
  }

  let rolebindings: RoleBindingCreateInput[] = [
    {
      ituser: "",
      role: { uuid: "", user_key: "", name: "" },
      validity: { from: "", to: "" },
    },
  ]

  const addRolebinding = () => {
    rolebindings = [
      ...rolebindings,
      {
        ituser: "",
        role: { uuid: "", user_key: "", name: "" },
        validity: { from: "", to: "" },
      },
    ]
  }
  const removeRolebinding = (index: number) => {
    rolebindings = rolebindings.filter((_, i) => i !== index)
  }

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue

      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          const itUserInput = result.data.itUserInput
          const rolebindingInput = result.data.rolebindingInput
          if (rolebindings && rolebindingInput) {
            try {
              const mutation = await graphQLClient().request(
                CreateItUserAndRolebindingDocument,
                {
                  itUserInput: itUserInput,
                  rolebindingInput: rolebindingInput,
                  date: itUserInput.validity.from,
                }
              )
              $success = {
                message: capital(
                  $_("success_create_item", {
                    values: {
                      item: $_("ituser", { values: { n: 0 } }),
                      name: mutation.ituser_create.current?.person_response?.current
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
          } else {
            try {
              const mutation = await graphQLClient().request(CreateItUserDocument, {
                itUserInput: itUserInput,
                date: itUserInput.validity.from,
              })
              $success = {
                message: capital(
                  $_("success_create_item", {
                    values: {
                      item: $_("ituser", { values: { n: 0 } }),
                      name: mutation.ituser_create.current?.person_response?.current
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
        }
      }
    }

  // Roles for the chosen IT system, refetched from the select's on:change.
  // A query, so switching systems quickly cannot apply a stale role list.
  const itSystemRoles = createQuery<UnpackedClass | undefined>()
  const fetchItSystemRoles = (itSystemUuid: string | undefined | null) =>
    itSystemRoles.run(async (signal) => {
      const res = await graphQLClient(signal).request(GetItSystemRolesDocument, {
        itSystemUuid: itSystemUuid,
      })
      return res.classes?.objects
        .map((cls) => cls.objects[0])
        .sort((a, b) => (a.name > b.name ? 1 : -1))
    })

  // Datepicker bounds for the person. See the employee edit engagement form
  // for the query pattern and its trade-offs.
  const validities = createQuery<{
    from: string | undefined | null
    to: string | undefined | null
  }>({ from: null, to: null })
  $: if ($page.params.uuid) {
    const personUuid = $page.params.uuid
    validities.run((signal) => getPersonValidities(personUuid, signal))
  } else {
    validities.run(async () => ({ from: null, to: null }))
  }

  const facets = createQuery<FacetValidities[]>()
  // Only fetch when a start date is set: the query rejects a null date, and
  // the primary select is disabled without one anyway.
  $: if (startDate) {
    facets.run((signal) =>
      getPrimaryClasses(
        {
          fromDate: startDate,
          primaryClass: env.PUBLIC_PRIMARY_CLASS_USER_KEY,
        },
        signal
      )
    )
  }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("ituser", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("ituser", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request(ItSystemsDocument, { currentDate: $date })}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
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
  </div>
{:then data}
  {@const itSystems = data.itsystems.objects}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <!-- TODO: At some point ITUsers will be linked to engagements, -->
          <!-- when this happens, datepickers needs to use engagement -> org_unit validities -->
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
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : $validities.data?.from}
            max={$validities.data?.to}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("it_system"))}
            id="it-system"
            bind:name={$itSystemField.value}
            bind:value={itSystem}
            errors={$itSystemField.errors}
            on:change={() => {
              fetchItSystemRoles(itSystem.uuid)
            }}
            iterable={formatITSystemNames(itSystems)}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            bind:value={$accountName.value}
            errors={$accountName.errors}
            extra_classes="basis-1/2"
            title={capital($_("account_name"))}
            id="account-name"
            required={true}
          />
        </div>
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
            id="primary"
            iterable={filterClassesByFacetUserKey($facets.data, "primary_type")}
            disabled={!startDate || $facets.error}
            isClearable={true}
          />
        {/if}
        <Input title={capital($_("external_id"))} id="external-id" />
        <TextArea title={capital($_("notes"))} id="notes" />
        <div class="divider p-0 m-0 mb-4 w-full" />
        <h4>{capital($_("rolebinding", { values: { n: 2 } }))}</h4>
        {#if $itSystemRoles.error}
          <p class="text-sm text-error">
            {capital(
              $_($itSystemRoles.data?.length ? "load_error_options" : "load_error")
            )}
          </p>
        {/if}
        {#each rolebindings as rolebinding, index}
          {@const isLast = index === rolebindings.length - 1}
          {#if $itSystemRoles.data?.length}
            {#key $itSystemRoles.data}
              <Select
                title={capital($_("role", { values: { n: 1 } }))}
                bind:value={rolebinding.role}
                id="it-system-role-uuid"
                iterable={$itSystemRoles.data}
                extra_classes="basis-1/2"
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
          <div class="flex items-center gap-2" class:mb-4={isLast}>
            {#if rolebindings.length > 1}
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
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("create_item", {
            values: { item: $_("ituser", { values: { n: 1 } }) },
          })
        )}
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
