<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import CircleButton from "$lib/components/shared/CircleButton.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { FacetValidities } from "$lib/utils/classes"
  import type { SubmitFunction } from "./$types"
  import { CreateRoleBindingDocument, ItUsersDocument } from "./query.generated"
  import type { RoleBindingCreateInput } from "$lib/graphql/types"
  import { createQuery } from "$lib/http/query"
  import { getItuserValidities } from "$lib/http/getValidities"
  import { getRoleClasses } from "$lib/http/getClasses"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { formatITUserITSystemName } from "$lib/utils/helpers"
  import removeRounded from "@iconify/icons-material-symbols/remove-rounded"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"

  gql`
    query ItUsers($uuid: [UUID!]!, $fromDate: DateTime!) {
      org_units(filter: { uuids: $uuid }) {
        objects {
          validities {
            itusers(filter: { from_date: $fromDate }) {
              user_key
              uuid
              itsystem_response {
                uuid
                current(at: $fromDate) {
                  name
                }
              }
            }
          }
        }
      }
    }

    mutation CreateRoleBinding($input: [RoleBindingCreateInput!]!, $date: DateTime!) {
      rolebindings_create(input: $input) {
        current(at: $date) {
          ituser_response {
            uuid
            current(at: $date) {
              org_unit_response {
                uuid
                current(at: $date) {
                  name
                }
              }
            }
          }
        }
      }
    }
  `

  let itUser: {
    uuid: string
    name: string
    itsystem: {
      uuid: string
    }
  }
  let startDate: string = $date
  let toDate: string

  const fromDate = field("from", "", [required()])
  const itUserField = field("it_user", "", [required()])
  const roleField = field("role", "", [required()])
  const svelteForm = form(fromDate, itUserField, roleField)

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(CreateRoleBindingDocument, {
              input: result.data.rolebindingInput,
              date: result.data.rolebindingInput[0].validity.from,
            })
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("rolebinding", { values: { n: 0 } }),
                    name: mutation.rolebindings_create[0].current?.ituser_response
                      ?.current?.org_unit_response?.current?.name,
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
      }
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

  // The org unit's IT users at the chosen start date. See the employee edit
  // engagement form for the query pattern and its trade-offs.
  const itUserOptions = createQuery<any[]>([])
  $: if ($page.params.uuid && startDate) {
    const orgUnitUuid = $page.params.uuid
    itUserOptions.run(async (signal) => {
      const res = await graphQLClient(signal).request(ItUsersDocument, {
        uuid: orgUnitUuid,
        fromDate: startDate,
      })
      return (
        formatITUserITSystemName(
          res.org_units.objects[0]?.validities?.flatMap((v) => v.itusers ?? [])
        ) ?? []
      )
    })
  }

  // Datepicker bounds for the selected IT user.
  const validities = createQuery<{
    from: string | undefined | null
    to: string | undefined | null
  }>({ from: null, to: null })
  $: if (itUser?.uuid) {
    const itUserUuid = itUser.uuid
    validities.run((signal) => getItuserValidities(itUserUuid, signal))
  } else {
    validities.run(async () => ({ from: null, to: null }))
  }

  const facets = createQuery<FacetValidities[]>()
  // Only fetch when a start date and an IT user are set: the role classes
  // depend on the IT user's system, and the role select is disabled without
  // them anyway.
  $: if (startDate && itUser?.uuid) {
    const itSystemUuid = itUser.itsystem.uuid
    facets.run((signal) =>
      getRoleClasses({ fromDate: startDate, itSystem: itSystemUuid }, signal)
    )
  }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("rolebinding", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("rolebinding", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <div class="p-8">
      <div class="flex flex-row gap-6">
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
      {#if $itUserOptions.error}
        <p class="text-sm text-error">
          {capital(
            $_($itUserOptions.data?.length ? "load_error_options" : "load_error")
          )}
        </p>
      {/if}
      <Select
        title={capital($_("ituser", { values: { n: 1 } }))}
        id="it-user-uuid"
        bind:value={itUser}
        bind:name={$itUserField.value}
        errors={$itUserField.errors}
        iterable={$itUserOptions.data}
        disabled={!startDate || $itUserOptions.error}
        required={true}
      />
      {#if $facets.error}
        <p class="text-sm text-error">
          {capital($_($facets.data ? "load_error_options" : "load_error"))}
        </p>
      {/if}
      {#each rolebindings as rolebinding, index}
        {#if $facets.data && filterClassesByFacetUserKey($facets.data, "role")?.length}
          {#key $facets.data}
            <Select
              title={capital($_("role", { values: { n: 1 } }))}
              id="role-uuid"
              bind:value={rolebinding.role}
              bind:name={$roleField.value}
              errors={$roleField.errors}
              iterable={filterClassesByFacetUserKey($facets.data, "role")}
              disabled={!startDate || $facets.error}
              extra_classes="basis-1/2"
              required
            />
          {/key}
        {:else}
          <Select
            title={capital($_("role", { values: { n: 1 } }))}
            id="role-uuid"
            bind:name={$roleField.value}
            errors={$roleField.errors}
            extra_classes="basis-1/2"
            required
            disabled
          />
        {/if}
        {#if rolebindings.length > 1}
          <CircleButton
            on:click={() => {
              removeRolebinding(index)
            }}
            icon={removeRounded}
          />
        {/if}
        {#if index === rolebindings.length - 1}
          <CircleButton
            on:click={() => addRolebinding()}
            icon={addRounded}
            extraClasses="mb-4"
          />
        {:else}
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
          values: { item: $_("rolebinding", { values: { n: 1 } }) },
        })
      )}
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
