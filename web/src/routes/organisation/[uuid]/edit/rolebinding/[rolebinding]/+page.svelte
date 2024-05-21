<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { UnpackedClass } from "$lib/util/helpers"
  import type { SubmitFunction } from "./$types"
  import {
    UpdateRoleBindingDocument,
    RolebindingAndFacetDocument,
    GetItSystemRolesDocument,
  } from "./query.generated"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getITUserITSystemName, getMinMaxValidities } from "$lib/util/helpers"
  import Search from "$lib/components/Search.svelte"

  let itUser: {
    uuid: string | null
    name: string
    user_key: string | null
    itsystem: {
      uuid: string | null
      name: string
    }
  }

  let toDate: string

  const fromDate = field("from", "", [required()])
  const itUserField = field("it_user", "", [required()])
  const role = field("role", "", [required()])
  const svelteForm = form(fromDate, itUserField, role)

  let itSystemRoles: UnpackedClass | undefined

  gql`
    query RolebindingAndFacet(
      $uuid: [UUID!]
      $orgUnitUuid: [UUID!]
      $fromDate: DateTime
    ) {
      rolebindings(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          current {
            ituser {
              org_unit {
                name
                uuid
                itusers {
                  itsystem {
                    name
                    user_key
                    uuid
                  }
                  uuid
                  user_key
                }
              }
            }
          }
          validities {
            uuid
            ituser {
              itsystem {
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
      org_units(filter: { uuids: $orgUnitUuid, from_date: null, to_date: null }) {
        objects {
          validities {
            validity {
              from
              to
            }
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

    mutation UpdateRoleBinding($input: RoleBindingUpdateInput!) {
      rolebinding_update(input: $input) {
        objects {
          ituser {
            org_unit {
              name
            }
          }
        }
      }
    }
  `
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
            })
            $success = {
              message: capital(
                $_("success_edit", {
                  values: {
                    item: $_("rolebinding", { values: { n: 0 } }),
                    name: mutation.rolebinding_update.objects[0].ituser[0].org_unit?.[0]
                      .name,
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

  const fetchItSystemRoles = async (itSystemUuid: string | undefined | null) => {
    const res = await graphQLClient().request(GetItSystemRolesDocument, {
      itSystemUuid: itSystemUuid,
    })
    itSystemRoles = res.classes?.objects[0]?.objects
  }

  $: if (itUser?.itsystem?.uuid) {
    fetchItSystemRoles(itUser.itsystem.uuid)
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

{#await graphQLClient().request( RolebindingAndFacetDocument, { uuid: $page.params.rolebinding, fromDate: $date, orgUnitUuid: $page.params.uuid } )}
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
  {@const validities = getMinMaxValidities(data.org_units.objects[0].validities)}
  {@const itusers =
    data.rolebindings.objects[0].current?.ituser[0].org_unit?.[0].itusers}
  {@const itUserStartValue = getITUserITSystemName(
    data.rolebindings.objects[0].validities[0].ituser
  )}
  {@const roleStartValue = data.rolebindings.objects[0].validities[0].role[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <!-- TODO: dynamically change dates depending on which org has been chosen -->
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={toDate ? toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <Search
          type="org-unit"
          startValue={{
            uuid: data.rolebindings.objects[0].current?.ituser[0].org_unit
              ? data.rolebindings.objects[0].current?.ituser[0].org_unit[0].uuid
              : undefined,
            name: data.rolebindings.objects[0].current?.ituser[0].org_unit
              ? data.rolebindings.objects[0].current?.ituser[0].org_unit[0].name
              : "",
          }}
          disabled
          required={true}
        />
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("ituser", { values: { n: 1 } }))}
            id="it-user-uuid"
            startValue={itUserStartValue[0]}
            bind:value={itUser}
            bind:name={$itUserField.value}
            errors={$itUserField.errors}
            iterable={getITUserITSystemName(itusers ? itusers : [])}
            on:change={() => {
              fetchItSystemRoles(itUser.itsystem.uuid)
              $role.value = ""
            }}
            required={true}
            disabled
            extra_classes="basis-1/2"
          />
          {#if itSystemRoles && itSystemRoles.length}
            <Select
              title={capital($_("role", { values: { n: 1 } }))}
              id="it-system-role-uuid"
              startValue={itSystemRoles?.some(
                (role) => role.uuid === roleStartValue.uuid
              )
                ? roleStartValue
                : undefined}
              bind:name={$role.value}
              errors={$role.errors}
              iterable={itSystemRoles}
              extra_classes="basis-1/2"
              required
            />
          {/if}
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("edit_item", {
            values: { item: $_("rolebinding", { values: { n: 1 } }) },
          })
        )}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  </form>
{/await}
