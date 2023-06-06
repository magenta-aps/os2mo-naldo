<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import { ItUsersDocument, UpdateItUserDocument } from "./query.generated"
  import type { SubmitFunction } from "./$types"

  gql`
    query ITUsers($uuid: [UUID!]) {
      itusers(uuids: $uuid) {
        uuid
        objects {
          uuid
          primary_uuid
          itsystem {
            name
            uuid
          }
          validity {
            from
            to
          }
          user_key
        }
      }
      itsystems {
        name
        uuid
      }
    }

    mutation UpdateITUser($input: ITUserUpdateInput!) {
      ituser_update(input: $input) {
        uuid
      }
    }
  `


  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          await graphQLClient().request(UpdateItUserDocument, {
            input: result.data,
          })

          $success = {
            message: "IT brugeren er blevet redigeret",
            uuid: $page.params.uuid,
            type: "organisation",
          }
          setTimeout(
            () => goto(`${base}/organisation/${$page.params.uuid}`),
            200
          )
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }

  let fromDate: string
  let toDate: string
</script>

{#await graphQLClient().request(ItUsersDocument, { uuid: $page.params.ituser })}
  Henter data...
{:then data}
  {@const it_user = data.itusers[0].objects[0]}
  {@const minDate = it_user.validity.from.split("T")[0]}
  {@const maxDate = it_user.validity.to?.split("T")[0]}

  <title>Rediger {it_user.itsystem.name} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger {it_user.itsystem.name}</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form
    method="post"
    use:enhance={handler}
  >
    <div class="flex flex-row gap-6 mx-6 mb-4">
      <div class="form-control">
        <DateInput
          bind:value={fromDate}
          startValue={minDate}
          title="Startdato"
          id="from"
          max={maxDate
            ? maxDate
            : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
      </div>
      <div class="form-control">
        <DateInput
          bind:value={toDate}
          startValue={maxDate}
          title="Slutdato"
          id="to"
          min={minDate}
          max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
      </div>
    </div>

    <!-- TODO: Should have the current value as default -->
    <div class="mx-6">
      <div class="flex flex-row gap-6 mb-6">
        <div class="basis-1/2">
          <Select
            title="IT-systemer"
            id="itsystem"
            iterable={data.itsystems.sort((a, b) => (a.name > b.name ? 1 : -1))}
          />
        </div>
        <div class="basis-1/2">
          <Input
            title="Kontonavn"
            id="user-key"
            value={it_user.user_key}
          />
        </div>
      </div>
      <div class="form-control">
        <div class="flex">
          <label class="label cursor-pointer gap-4">
            <input
              type="checkbox"
              id="primary"
              name="primary"
              checked={it_user.primary_uuid ===
                "0644cd06-b84b-42e0-95fe-ce131c21fbe6"}
              class="checkbox checkbox-primary rounded normal-case font-normal text-base text-base-100"
            />
            <p>Primary</p>
          </label>
        </div>
      </div>
    </div>
    <div class="modal-action p-6 gap-4 bg-slate-100">
      <a
        href={`${base}/organisation/${$page.params.uuid}`}
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        >Annullér</a
      >
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger IT bruger</button
      >
    </div>
    <Error />
  </form>
{/await}
