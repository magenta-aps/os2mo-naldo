<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Error from "$lib/components/alerts/Error.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import type { SubmitFunction } from "./$types"
  import { EngagementDocument, UpdateEngagementDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import EngagementFields from "$lib/components/forms/entity/EngagementFields.svelte"
  import {
    engagementToValues,
    engagementValuesChanged,
    type EngagementValues,
  } from "$lib/components/forms/entity/types"

  gql`
    query Engagement($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      engagements(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            engagement_type_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            job_function_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            primary_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            validity {
              from
              to
            }
            org_unit_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            extension_1
            extension_4
          }
        }
      }
    }

    mutation UpdateEngagement($input: EngagementUpdateInput!, $date: DateTime!) {
      engagement_update(input: $input) {
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

  let fields: EngagementFields

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      if (!(await fields.validate())) return
      if (result.type !== "success" || !result.data) return

      try {
        const mutation = await graphQLClient().request(UpdateEngagementDocument, {
          input: result.data,
          date: result.data.validity.from,
        })
        $success = {
          message: capital(
            $_("success_edit_item", {
              values: {
                item: $_("engagement", { values: { n: 0 } }),
                name: mutation.engagement_update.current?.person_response?.current
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

  // Created in the script (not inline in the {#await} tag) so the result can
  // be captured below without a side effect in the template.
  const engagementPromise = graphQLClient().request(EngagementDocument, {
    uuid: $page.params.engagement,
    fromDate: $page.url.searchParams.get("from"),
    toDate: $page.url.searchParams.get("to"),
  })

  // Two independent copies: `values` is live (bound to the field group),
  // `initialValues` stays as fetched, for change detection.
  let values: EngagementValues | null = null
  let initialValues: EngagementValues | null = null
  engagementPromise.then(
    (data) => {
      const engagement = data.engagements.objects[0].validities[0]
      values = engagementToValues(engagement)
      initialValues = engagementToValues(engagement)
    },
    // The template's {#await} has no {:catch}, so a failed load stays on the
    // pending branch. This handler only prevents an unhandled rejection from
    // this second promise chain.
    () => {}
  )

  let hasChanges = false
  $: hasChanges =
    values && initialValues ? engagementValuesChanged(values, initialValues) : false
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("engagement", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("engagement", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await engagementPromise}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <Skeleton />
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
{:then}
  {#if values}
    <form method="post" class="mx-6" use:enhance={handler}>
      <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
        <div class="p-8">
          <EngagementFields bind:value={values} bind:this={fields} />
        </div>
      </div>
      <div class="flex py-6 gap-4">
        <Button
          type="submit"
          title={capital(
            $_("edit_item", {
              values: { item: $_("engagement", { values: { n: 1 } }) },
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
  {/if}
{/await}
