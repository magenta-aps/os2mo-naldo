<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Error from "$lib/components/alerts/Error.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { CreateEngagementDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import type { SubmitFunction } from "./$types"
  import EngagementFields from "$lib/components/forms/entity/EngagementFields.svelte"
  import {
    createDefaultEngagementValues,
    type EngagementValues,
  } from "$lib/components/forms/entity/types"

  let values: EngagementValues = createDefaultEngagementValues()
  // The unit is fixed by the route; the field group keys its date bounds and
  // class options off it.
  values.orgUnit = $page.params.uuid ? { uuid: $page.params.uuid, name: "" } : undefined
  let fields: EngagementFields

  gql`
    mutation CreateEngagement($input: EngagementCreateInput!, $date: DateTime!) {
      engagement_create(input: $input) {
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
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      if (!(await fields.validate())) return
      if (result.type !== "success" || !result.data) return
      try {
        const mutation = await graphQLClient().request(CreateEngagementDocument, {
          input: result.data,
          date: result.data.validity.from,
        })
        $success = {
          message: capital(
            $_("success_create_item", {
              values: {
                item: $_("engagement", { values: { n: 0 } }),
                name: mutation.engagement_create.current?.person_response?.current
                  ?.name,
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
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("engagement", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("engagement", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <div class="p-8">
      <EngagementFields anchor="org-unit" bind:value={values} bind:this={fields} />
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("engagement", { values: { n: 1 } }) },
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
