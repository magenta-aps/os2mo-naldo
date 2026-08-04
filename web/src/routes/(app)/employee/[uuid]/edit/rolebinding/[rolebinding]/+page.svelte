<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import { UpdateRoleBindingDocument, RolebindingDocument } from "./query.generated"
  import type { FacetValidities } from "$lib/utils/classes"
  import { createQuery } from "$lib/http/query"
  import { getItuserValidities } from "$lib/http/getValidities"
  import { getRoleClasses } from "$lib/http/getClasses"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { getITUserITSystemName } from "$lib/utils/display"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { normalizeRolebinding } from "$lib/utils/normalizeForm"

  gql`
    query Rolebinding($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      rolebindings(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            ituser_response {
              uuid
              current(at: $fromDate) {
                itsystem_response {
                  uuid
                  current(at: $fromDate) {
                    name
                  }
                }
                user_key
              }
            }
            role_response {
              uuid
              current(at: $fromDate) {
                user_key
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation UpdateRoleBinding($input: RoleBindingUpdateInput!, $date: DateTime!) {
      rolebinding_update(input: $input) {
        current(at: $date) {
          ituser_response {
            uuid
            current(at: $date) {
              person_response {
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
  const role = field("role", "", [required()])
  const svelteForm = form(fromDate, itUserField, role)

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateRoleBindingDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit_item", {
                  values: {
                    item: $_("rolebinding", { values: { n: 0 } }),
                    name: mutation.rolebinding_update.current?.ituser_response?.current
                      ?.person_response?.current?.name,
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

  // Datepicker bounds for the selected IT user. See the employee edit
  // engagement form for the query pattern and its trade-offs.
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

  // Created in the script (not inline in the {#await} tag) so the result can
  // be captured below without a side effect in the template.
  const rolebindingPromise = graphQLClient().request(RolebindingDocument, {
    uuid: $page.params.rolebinding,
    fromDate: $page.url.searchParams.get("from"),
    toDate: $page.url.searchParams.get("to"),
  })

  let initialRolebinding: any = null
  rolebindingPromise.then(
    (data) => {
      initialRolebinding = normalizeRolebinding(
        data.rolebindings.objects[0].validities[0]
      )
    },
    // A failed load renders the {:catch} branch; this handler only prevents
    // an unhandled rejection from this second promise chain.
    () => {}
  )
  let hasChanges = false
  $: if (initialRolebinding) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged = $role.value !== initialRolebinding.role

    const toDateExtended =
      toDate === ""
        ? initialRolebinding.to !== null
        : toDate > (initialRolebinding.to ?? null)
    hasChanges = editableChanged || toDateExtended
  }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("rolebinding", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("rolebinding", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await rolebindingPromise}
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
      </div>
    </div>
  </div>
{:then data}
  {@const rolebinding = data.rolebindings.objects[0].validities[0]}
  {@const ituser = getITUserITSystemName([
    {
      uuid: rolebinding.ituser_response.uuid,
      user_key: rolebinding.ituser_response.current?.user_key ?? "",
      itsystem_response: rolebinding.ituser_response.current?.itsystem_response,
    },
  ])}

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
            startValue={rolebinding.validity.to
              ? rolebinding.validity.to.split("T")[0]
              : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : $validities.data?.from}
            max={$validities.data?.to}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("ituser", { values: { n: 1 } }))}
            id="it-user-uuid"
            startValue={ituser?.[0]}
            bind:value={itUser}
            bind:name={$itUserField.value}
            errors={$itUserField.errors}
            required={true}
            disabled
            extra_classes="basis-1/2"
          />
          {#if $facets.data && filterClassesByFacetUserKey($facets.data, "role")?.length}
            <Select
              title={capital($_("role", { values: { n: 1 } }))}
              id="it-system-role-uuid"
              startValue={rolebinding.role_response?.current
                ? {
                    uuid: rolebinding.role_response.uuid,
                    name: rolebinding.role_response.current.name,
                    user_key: rolebinding.role_response.current.user_key,
                  }
                : undefined}
              bind:name={$role.value}
              errors={$role.errors}
              iterable={filterClassesByFacetUserKey($facets.data, "role")}
              disabled={!startDate || $facets.error}
              extra_classes="basis-1/2"
              required
            />
          {/if}
        </div>
        {#if $facets.error}
          <p class="text-sm text-error">
            {capital($_($facets.data ? "load_error_options" : "load_error"))}
          </p>
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("rolebinding", { values: { n: 1 } }) },
          })
        )}
        disabled={!hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
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
{:catch}
  <div class="mx-6">
    <p class="text-sm text-error">{capital($_("load_error"))}</p>
  </div>
{/await}
