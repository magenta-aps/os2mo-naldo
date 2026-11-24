<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { page } from "$app/stores"
  import { v4 as uuidv4 } from "uuid"
  import { graphQLClient } from "$lib/http/client"
  import { createQuery } from "$lib/http/query"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import PolicyForm from "$lib/components/admin/policies/PolicyForm.svelte"
  import {
    copyOf,
    emptyDraft,
    fromPolicy,
    isAccessDenied,
    type PolicyLoad,
  } from "$lib/utils/policies"
  import { PolicyDocument } from "../[policy]/query.generated"

  // policy_declare creates the policy when no policy has this uuid yet
  const uuid = uuidv4()
  // ?from=<uuid> starts from a copy of that policy's rules
  const from = $page.url.searchParams.get("from")
  const blank = emptyDraft(uuid)

  const copy = createQuery<PolicyLoad>()
  $: if (from)
    copy.run((signal) =>
      graphQLClient(signal)
        .request(PolicyDocument, { uuid: from })
        .then((res) => {
          const found = res.policies.objects[0]
          if (!found) return "missing"
          const name = $_("policy_copy_name", { values: { name: found.name } })
          return copyOf(fromPolicy(found), uuid, name)
        })
        .catch((err) => {
          if (isAccessDenied(err)) return "no_access"
          throw err
        })
    )

  $: draft = !from ? blank : typeof $copy.data === "object" ? $copy.data : undefined

  const title = capital(
    $_("create_item", { values: { item: $_("policy", { values: { n: 1 } }) } })
  )
</script>

<title>{title} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{title}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#if draft}
  <PolicyForm {draft} isNew={true} />
{:else if $copy.data === "missing" || $copy.data === "no_access" || $copy.error}
  <div class="mx-6">
    <p class="text-sm text-error">
      {capital(
        $copy.data === "missing"
          ? $_("no_item", { values: { item: $_("policy", { values: { n: 0 } }) } })
          : $_($copy.data === "no_access" ? "policy_no_access" : "load_error")
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
