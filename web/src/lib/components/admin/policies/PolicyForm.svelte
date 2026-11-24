<script lang="ts">
  import { _ } from "svelte-i18n"
  import { tick } from "svelte"
  import { capital } from "$lib/utils/helpers"
  import { base } from "$app/paths"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/http/client"
  import { success, error } from "$lib/stores/alert"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import ActiveToggle from "$lib/components/forms/shared/ActiveToggle.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { env } from "$lib/env"
  import { groupLabel } from "./labels"
  import RolesInput from "./RolesInput.svelte"
  import PermissionGroup from "./PermissionGroup.svelte"
  import {
    celErrorsOf,
    draftProblems,
    toState,
    visibleGroups,
    addableGroups,
    type GroupKey,
    type PolicyDraft,
  } from "$lib/utils/policies"
  import { DeclarePolicyDocument } from "./query.generated"

  gql`
    mutation DeclarePolicy($uuid: UUID!, $state: PolicyStateInput) {
      policy_declare(uuid: $uuid, state: $state) {
        uuid
        name
      }
    }
  `

  export let draft: PolicyDraft
  export let isNew: boolean

  $: readonly = draft.managed
  $: problems = draftProblems(draft)
  let submitted = false
  let sending = false
  // Conditions MO could not parse, by grant id, until the next edit
  let celErrors = new Map<number, string>()
  $: draft, (celErrors = new Map())

  let formElement: HTMLFormElement

  // Groups picked from the list, shown before anything is granted in them
  let added: GroupKey[] = []
  let picked: { uuid: string | null; name: string } | undefined
  const addGroup = (group: GroupKey) => {
    added = [...added, group]
    picked = undefined
  }

  // A problem can sit in a closed group, out of sight
  const showProblems = async () => {
    await tick()
    const marked = [...formElement.querySelectorAll(".text-error, .input-error")]
    for (const group of formElement.querySelectorAll("details")) {
      if (marked.some((el) => group.contains(el))) group.open = true
    }
    await tick()
    marked[0]?.scrollIntoView({ block: "center", behavior: "smooth" })
  }

  const submit = async () => {
    submitted = true
    if (readonly) return
    if (problems.size) return showProblems()
    sending = true
    try {
      const res = await graphQLClient().request(DeclarePolicyDocument, {
        uuid: draft.uuid,
        state: toState(draft),
      })
      $success = {
        message: capital(
          $_(isNew ? "success_create_item" : "success_edit_item", {
            values: {
              item: $_("policy", { values: { n: 0 } }),
              name: res.policy_declare?.name ?? draft.name,
            },
          })
        ),
        type: "policy",
      }
    } catch (err) {
      const messages: string[] =
        (
          err as { response?: { errors?: { message: string }[] } }
        ).response?.errors?.map((e) => e.message) ?? []
      const found = celErrorsOf(draft, messages)
      if (found.size) {
        celErrors = found
        showProblems()
      } else $error = { message: err }
    } finally {
      sending = false
    }
  }

  const remove = async () => {
    if (
      !window.confirm(
        capital($_("policy_delete_confirm", { values: { name: draft.name } }))
      )
    )
      return
    sending = true
    try {
      await graphQLClient().request(DeclarePolicyDocument, {
        uuid: draft.uuid,
        state: null,
      })
      $success = {
        message: capital($_("policy_deleted", { values: { name: draft.name } })),
        type: "policy",
      }
    } catch (err) {
      $error = { message: err }
    } finally {
      sending = false
    }
  }
</script>

<form
  class="mx-6 pb-12 flex flex-col gap-4"
  on:submit|preventDefault={submit}
  novalidate
  bind:this={formElement}
>
  {#if readonly}
    <div role="alert" class="alert alert-info rounded-sm sm:w-full xl:w-3/4">
      {capital($_("policy_managed_help"))}
    </div>
  {/if}

  <div class="sm:w-full xl:w-3/4 bg-base-200 rounded-sm">
    <div class="p-8">
      <Input
        title={capital($_("name"))}
        id="name"
        bind:value={draft.name}
        errors={submitted && problems.has("name") ? ["required"] : []}
        required={true}
        disabled={readonly}
      />
      <TextArea
        title={capital($_("description"))}
        id="description"
        bind:value={draft.description}
        disabled={readonly}
      />
      <ActiveToggle id="active" bind:checked={draft.active} disabled={readonly} />
      <RolesInput bind:roles={draft.roles} disabled={readonly} />

      <div class="divider p-0 m-0 my-2 w-full" />

      <p class="text-sm pb-1">{capital($_("policy_permissions"))}</p>
      <p class="text-sm text-base-content/70 pb-4">
        {capital($_("policy_permissions_help"))}
      </p>
      <div class="flex flex-col gap-2">
        {#each visibleGroups(draft, added) as group (group)}
          <PermissionGroup
            {group}
            bind:draft
            disabled={readonly}
            problems={submitted ? problems : undefined}
            {celErrors}
            startOpen={added.includes(group)}
          />
        {:else}
          <p class="text-sm text-base-content/70">
            {capital($_("policy_no_permissions"))}
          </p>
        {/each}
      </div>
      {#if !readonly}
        <div class="pt-4">
          <Select
            title={capital($_("policy_add_group"))}
            id="policy-add-group"
            bind:value={picked}
            iterable={addableGroups(draft, added).map((group) => ({
              uuid: group,
              name: capital(groupLabel(group, $_)),
            }))}
            on:change={(e) => addGroup(e.detail.uuid)}
          />
        </div>
      {/if}
    </div>
  </div>

  {#if (submitted && problems.size) || celErrors.size}
    <p class="text-sm text-error">{capital($_("policy_fix_problems"))}</p>
  {/if}

  <div
    class="sticky {env.PUBLIC_ENVIRONMENT === 'prod'
      ? 'bottom-0'
      : 'bottom-7'} z-10 flex py-3 gap-4 sm:w-full xl:w-3/4 bg-base-100 border-t border-base-300"
  >
    {#if !readonly}
      <Button
        type="submit"
        title={capital(
          isNew
            ? $_("create_item", {
                values: { item: $_("policy", { values: { n: 1 } }) },
              })
            : $_("save")
        )}
        disabled={sending}
      />
    {/if}
    <Button
      type="button"
      title={capital($_(readonly ? "back" : "cancel"))}
      outline={true}
      href="{base}/admin/policies"
    />
    {#if !isNew}
      <Button
        type="button"
        title={capital($_("policy_copy"))}
        outline={true}
        href="{base}/admin/policies/create?from={draft.uuid}"
      />
    {/if}
    <span class="flex-1" />
    {#if !isNew && !readonly}
      <button
        type="button"
        class="btn btn-sm btn-error btn-outline rounded-sm normal-case font-normal"
        disabled={sending}
        on:click={remove}
      >
        {capital($_("policy_delete"))}
      </button>
    {/if}
  </div>
  <Error />
</form>
