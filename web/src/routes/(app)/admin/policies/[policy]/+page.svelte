<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/http/client"
  import { createQuery } from "$lib/http/query"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import PolicyForm from "$lib/components/admin/policies/PolicyForm.svelte"
  import { fromPolicy, isAccessDenied, type PolicyLoad } from "$lib/utils/policies"
  import { PolicyDocument } from "./query.generated"

  gql`
    query Policy($uuid: UUID!) {
      policies(filter: { uuids: [$uuid] }) {
        objects {
          uuid
          name
          description
          active
          managed
          selectors {
            kind
            value
          }
          read_rules {
            collection
            fields
            condition
            graphql_version
          }
          write_rules {
            mutator
            condition
            graphql_version
          }
        }
      }
    }
  `

  const policy = createQuery<PolicyLoad>()
  $: policy.run((signal) =>
    graphQLClient(signal)
      .request(PolicyDocument, { uuid: $page.params.policy })
      .then((res) => {
        const found = res.policies.objects[0]
        return found ? fromPolicy(found) : "missing"
      })
      .catch((err) => {
        if (isAccessDenied(err)) return "no_access"
        throw err
      })
  )

  $: draft = typeof $policy.data === "object" ? $policy.data : undefined
  $: title = draft?.managed
    ? draft.name
    : capital($_("edit_item", { values: { item: $_("policy", { values: { n: 1 } }) } }))
</script>

<title>{title} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{title}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#if draft}
  <PolicyForm {draft} isNew={false} />
{:else if $policy.data === "missing" || $policy.data === "no_access" || $policy.error}
  <div class="mx-6">
    <p class="text-sm text-error">
      {capital(
        $policy.data === "missing"
          ? $_("no_item", { values: { item: $_("policy", { values: { n: 0 } }) } })
          : $_($policy.data === "no_access" ? "policy_no_access" : "load_error")
      )}
    </p>
  </div>
{:else}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm p-8">
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  </div>
{/if}
