<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { onMount } from "svelte"
  import {
    PoliciesDocument,
    DeletePolicyDocument,
    type PoliciesQuery,
  } from "./query.generated"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { success, error } from "$lib/stores/alert"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Icon from "@iconify/svelte"
  import deleteOutlineRounded from "@iconify/icons-material-symbols/delete-outline-rounded"

  // Magic UUID of the bootstrap "Policy Administrator" policy. It is protected
  // from deletion in the backend, so we also disable its delete action here.
  // Keep in sync with mora.db.policies.POLICYADMIN_UUID.
  const POLICYADMIN_UUID = "ded1ca7e-9bac-5eed-706f-6c61646d696e"

  type Policies = PoliciesQuery["policies"]["objects"]
  let data: Policies | undefined

  let dialog: HTMLDialogElement
  let policyToDelete: { uuid: string; name: string } | null = null

  gql`
    query Policies {
      policies {
        objects {
          uuid
          name
          description
          start
          end
        }
      }
    }

    mutation DeletePolicy($input: PolicyDeleteInput!) {
      policy_delete(input: $input)
    }
  `

  $: headers = [
    { title: capital($_("name")), sortPath: "name" },
    { title: capital($_("description")), sortPath: "description" },
    { title: capital($_("date.date")), sortPath: "start" },
  ]

  $: if (data) {
    data = sortData(data, $sortKey, $sortDirection)
  }

  const load = async () => {
    const res = await graphQLClient().request(PoliciesDocument)
    data = res.policies.objects
  }

  onMount(load)

  const openDelete = (policy: { uuid: string; name: string }) => {
    policyToDelete = { uuid: policy.uuid, name: policy.name }
    dialog.showModal()
  }

  const confirmDelete = async () => {
    if (!policyToDelete) return
    try {
      await graphQLClient().request(DeletePolicyDocument, {
        input: { uuid: policyToDelete.uuid },
      })
      $success = {
        message: capital(
          $_("success_delete_item", {
            values: { item: $_("policies", { values: { n: 0 } }) },
          })
        ),
      }
      await load()
    } catch (err) {
      $error = { message: err }
    } finally {
      dialog.close()
      policyToDelete = null
    }
  }
</script>

<DetailTable {headers}>
  {#if !data}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4">{capital($_("loading"))}</td>
    </tr>
  {:else}
    {#each data as policy, i}
      <tr
        class="{i % 2 === 0 ? '' : 'bg-base-200'}
          leading-5 border-t border-base-300 text-base-content"
      >
        <td class="text-sm p-4">{policy.name}</td>
        <td class="text-sm p-4">{policy.description ?? ""}</td>
        <ValidityTableCell validity={{ from: policy.start, to: policy.end }} />
        <td class="flex p-4 gap-2 justify-end">
          {#if policy.uuid === POLICYADMIN_UUID}
            <span
              class="tooltip tooltip-left cursor-not-allowed"
              data-tip={$_("policyadmin_protected")}
            >
              <Icon
                icon={deleteOutlineRounded}
                width="25"
                height="25"
                class="opacity-30"
              />
            </span>
          {:else}
            <button type="button" on:click={() => openDelete(policy)}>
              <Icon icon={deleteOutlineRounded} width="25" height="25" />
            </button>
          {/if}
        </td>
      </tr>
    {:else}
      <tr class="leading-5 border-t border-base-300 text-base-content">
        <td class="text-sm p-4"
          >{capital(
            $_("no_item", { values: { item: $_("policies", { values: { n: 2 } }) } })
          )}</td
        >
      </tr>
    {/each}
  {/if}
</DetailTable>

<dialog bind:this={dialog} class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">
      {capital(
        $_("delete_item", { values: { item: $_("policies", { values: { n: 1 } }) } })
      )}
    </h3>
    {#if policyToDelete}
      <p class="py-4">
        {$_("confirm_delete_policy", { values: { name: policyToDelete.name } })}
      </p>
    {/if}
    <div class="modal-action">
      <Button
        type="button"
        title={capital(
          $_("delete_item", { values: { item: $_("policies", { values: { n: 1 } }) } })
        )}
        on:click={confirmDelete}
      />
      <Button
        type="button"
        outline={true}
        title={capital($_("cancel"))}
        on:click={() => dialog.close()}
      />
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
