<script lang="ts">
  import { _ } from "svelte-i18n"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import { FacetsAndRoleDocument, UpdateRoleDocument } from "./query.generated"
  import Search from "$lib/components/search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"

  let toDate: string
  let selectedOrgUnit: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const orgUnit = field("org_unit", "", [required()])
  const roleType = field("role_type", "", [required()])
  const svelteForm = form(fromDate, orgUnit, roleType)

  gql`
    query FacetsAndRole($uuid: [UUID!], $fromDate: DateTime) {
      facets(filter: { user_keys: "role_type" }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              uuid
              user_key
              name
            }
          }
        }
      }
      roles(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            employee {
              name
              validity {
                from
                to
              }
            }
            org_unit {
              name
              uuid
            }
            role_type {
              name
              uuid
            }
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation UpdateRole($input: RoleUpdateInput!) {
      role_update(input: $input) {
        objects {
          employee {
            name
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
            const mutation = await graphQLClient().request(UpdateRoleDocument, {
              input: result.data,
            })
            $success = {
              message: `Rollen ${
                mutation.role_update.objects[0].employee
                  ? `for ${mutation.role_update.objects[0].employee[0].name}`
                  : ""
              } redigeres fra d. ${$fromDate.value}`,
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<title>{$_("edit")} {$_("role")} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{$_("edit")} {$_("role")}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( FacetsAndRoleDocument, { uuid: $page.params.role, fromDate: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <Skeleton />
        <!-- TODO: Make Skeleton better for Breadcrumbs? -->
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const facets = data.facets.objects}
  {@const role = data.roles.objects[0].objects[0]}
  {@const minDate =
    data.roles.objects[0].objects[0].employee[0].validity?.from?.split("T")[0]}
  {@const maxDate =
    data.roles.objects[0].objects[0].employee[0].validity?.to?.split("T")[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={$_("date.start_date")}
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={role.validity?.to?.split("T")[0]}
            title={$_("date.end_date")}
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>
        <Search
          type="org-unit"
          startValue={{
            uuid: role.org_unit[0].uuid,
            name: role.org_unit[0].name,
          }}
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          on:clear={() => ($orgUnit.value = "")}
          bind:value={selectedOrgUnit}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        <Select
          title={$_("role_type")}
          id="role-type"
          startValue={role.role_type}
          bind:name={$roleType.value}
          errors={$roleType.errors}
          iterable={getClassesByFacetUserKey(facets, "role_type")}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{$_("edit")} {$_("role")}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        {$_("cancel")}
      </button>
    </div>
    <Error />
  </form>
{/await}
