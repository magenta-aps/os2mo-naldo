<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { createQuery } from "$lib/http/query"
  import { Collection } from "$lib/graphql/types"
  import {
    grantsOf,
    mutatorsOf,
    newReadGrant,
    newWriteGrant,
    POLICY_GRAPHQL_VERSION,
    type DraftProblem,
    type GroupKey,
    type PolicyDraft,
  } from "$lib/utils/policies"
  import { groupLabel } from "./labels"
  import GrantBlock from "./GrantBlock.svelte"
  import Button from "$lib/components/shared/Button.svelte"

  // Not a gql tag: codegen cannot type introspection fields such as __type
  const collectionFields = `
    query PolicyCollectionFields($name: String!) {
      __type(name: $name) {
        fields(includeDeprecated: true) {
          name
          isDeprecated
        }
      }
    }
  `
  type CollectionFields = {
    __type: { fields: { name: string; isDeprecated: boolean }[] | null } | null
  }

  export let group: GroupKey
  export let draft: PolicyDraft
  export let disabled = false
  // Problems show only after a submit, so an untouched form is not red
  export let problems: Map<string | number, DraftProblem[]> | undefined = undefined
  export let celErrors: Map<number, string> | undefined = undefined
  // A group just picked from the list opens, to grant something in it
  export let startOpen = false

  const isCollection = Object.values(Collection).includes(group as Collection)
  const mutators = mutatorsOf(group)

  $: ({ reads, writes } = grantsOf(draft, group))
  // Closed at first: the badges on the summary show what a group grants, and a
  // policy granting every field of every collection would otherwise be pages long
  let open = startOpen

  // A collection is the GraphQL type of the same name, and its fields are the
  // ones a read rule grants. Deprecated fields only show when a rule has them.
  const fields = createQuery<string[]>()
  let fieldsRequested = false
  $: if (open && isCollection && !fieldsRequested) {
    fieldsRequested = true
    fields.run((signal) =>
      graphQLClient(signal)
        .request<CollectionFields>(collectionFields, { name: group })
        .then(
          (res) =>
            res.__type?.fields?.filter((f) => !f.isDeprecated).map((f) => f.name) ?? []
        )
    )
  }

  const union = (known: string[], picked: string[]) =>
    [...new Set([...known, ...picked])].sort()

  const update = () => (draft = draft)

  const addRead = () => {
    draft.reads = [...draft.reads, newReadGrant(group)]
    open = true
  }
  const addWrite = () => {
    draft.writes = [...draft.writes, newWriteGrant(group)]
    open = true
  }
  const removeRead = (id: number) =>
    (draft.reads = draft.reads.filter((g) => g.id !== id))
  const removeWrite = (id: number) =>
    (draft.writes = draft.writes.filter((g) => g.id !== id))

  $: readFields = new Set(reads.flatMap((g) => g.fields)).size
  $: writeMutators = new Set(writes.flatMap((g) => g.mutators)).size
</script>

<details
  class="collapse collapse-arrow bg-base-100 border border-base-300 rounded-sm"
  bind:open
  data-group={group}
>
  <summary class="collapse-title flex flex-wrap items-center gap-x-3 gap-y-1 pr-12">
    <span class="text-base">{capital(groupLabel(group, $_))}</span>
    {#if isCollection}
      <span class="font-mono text-xs text-base-content/60">{group}</span>
    {/if}
    <span class="flex-1" />
    {#if readFields}
      <span class="badge badge-sm badge-primary badge-outline">
        {$_("policy_read_summary", { values: { n: readFields } })}
      </span>
    {/if}
    {#if writeMutators}
      <span class="badge badge-sm badge-primary badge-outline">
        {$_("policy_write_summary", { values: { n: writeMutators } })}
      </span>
    {/if}
  </summary>

  <div class="collapse-content flex flex-col gap-2">
    {#if isCollection || reads.length}
      <div class="divider divider-start text-sm m-0">{capital($_("policy_read"))}</div>
      {#if reads.length}
        <p class="text-sm text-base-content/70">{capital($_("policy_read_any"))}</p>
      {/if}
      {#each reads as grant (grant.id)}
        {@const grantProblems = problems?.get(grant.id) ?? []}
        <GrantBlock
          id="policy-read-{grant.id}"
          kind="read"
          title={capital($_("fields"))}
          collection={isCollection ? undefined : grant.collection}
          options={union($fields.data ?? [], grant.fields)}
          selected={grant.fields}
          condition={grant.condition}
          version={grant.graphql_version === POLICY_GRAPHQL_VERSION
            ? undefined
            : grant.graphql_version}
          loading={$fields.loading}
          loadError={$fields.error}
          missingCondition={grantProblems.includes("no_condition")}
          celError={celErrors?.get(grant.id)}
          celFlagged={grantProblems.includes("cel")}
          {disabled}
          on:select={(e) => {
            grant.fields = e.detail
            update()
          }}
          on:condition={(e) => {
            grant.condition = e.detail
            update()
          }}
          on:remove={() => removeRead(grant.id)}
        />
      {/each}
      {#if !disabled && isCollection}
        <div>
          <Button
            type="button"
            outline={true}
            title={capital($_("policy_add_read"))}
            on:click={addRead}
          />
        </div>
      {/if}
    {/if}

    {#if mutators.length || writes.length}
      <div class="divider divider-start text-sm m-0">{capital($_("policy_write"))}</div>
      {#if writes.length}
        <p class="text-sm text-base-content/70">{capital($_("policy_write_any"))}</p>
      {/if}
      {#each writes as grant (grant.id)}
        {@const grantProblems = problems?.get(grant.id) ?? []}
        <GrantBlock
          id="policy-write-{grant.id}"
          kind="write"
          title={capital($_("policy_mutators"))}
          options={union(mutators, grant.mutators)}
          selected={grant.mutators}
          condition={grant.condition}
          version={grant.graphql_version === POLICY_GRAPHQL_VERSION
            ? undefined
            : grant.graphql_version}
          missingCondition={grantProblems.includes("no_condition")}
          celError={celErrors?.get(grant.id)}
          celFlagged={grantProblems.includes("cel")}
          {disabled}
          on:select={(e) => {
            grant.mutators = e.detail
            update()
          }}
          on:condition={(e) => {
            grant.condition = e.detail
            update()
          }}
          on:remove={() => removeWrite(grant.id)}
        />
      {/each}
      {#if !disabled && mutators.length}
        <div>
          <Button
            type="button"
            outline={true}
            title={capital($_("policy_add_write"))}
            on:click={addWrite}
          />
        </div>
      {/if}
    {/if}
  </div>
</details>
