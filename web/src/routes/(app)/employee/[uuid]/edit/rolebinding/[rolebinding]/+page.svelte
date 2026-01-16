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
  import { getItuserValidities } from "$lib/http/getValidities"
  import { getRoleClasses } from "$lib/http/getClasses"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { formatITUserITSystemName } from "$lib/utils/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  gql`
    query Rolebinding($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      rolebindings(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            ituser(filter: { from_date: $fromDate, to_date: $toDate }) {
              itsystem {
                uuid
                name
              }
              uuid
              user_key
            }
            role {
              uuid
              user_key
              name
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
          ituser(filter: { from_date: null, to_date: null }) {
            person(filter: { from_date: null, to_date: null }) {
              name
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
                    name: mutation.rolebinding_update.current?.ituser?.[0].person?.[0]
                      .name,
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

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  let facets: FacetValidities[]
  let abortController: AbortController
  $: {
    // Abort the previous request if a new one is about to start
    if (abortController) abortController.abort()
    abortController = new AbortController()

    // Make sure `currentDate` isn't sent if startDate is null.
    const params = {
      fromDate: startDate,
      itSystem: itUser?.itsystem.uuid,
    }

    ;(async () => {
      validities = itUser?.uuid
        ? await getItuserValidities(itUser?.uuid)
        : { from: null, to: null }
      if (itUser?.uuid) {
        try {
          facets = await getRoleClasses(params, abortController.signal)
        } catch (err: any) {
          if (err.name !== "AbortError") {
            console.error("Request failed:", err)
          }
        }
      }
    })()
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

{#await graphQLClient().request( RolebindingDocument, { uuid: $page.params.rolebinding, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to") } )}
  <div class="mx-6">
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
      </div>
    </div>
  </div>
{:then data}
  {@const rolebinding = data.rolebindings.objects[0].validities[0]}
  {@const ituser = formatITUserITSystemName(rolebinding.ituser)}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={startDate}
            bind:validationValue={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={toDate ? toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={rolebinding.validity.to
              ? rolebinding.validity.to.split("T")[0]
              : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
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
          {#if facets && filterClassesByFacetUserKey(facets, "role")?.length}
            <Select
              title={capital($_("role", { values: { n: 1 } }))}
              id="it-system-role-uuid"
              startValue={rolebinding.role[0]}
              bind:name={$role.value}
              errors={$role.errors}
              iterable={filterClassesByFacetUserKey(facets, "role")}
              extra_classes="basis-1/2"
              required
            />
          {/if}
        </div>
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
