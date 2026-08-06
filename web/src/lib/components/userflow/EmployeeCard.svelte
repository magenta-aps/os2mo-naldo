<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Button from "$lib/components/shared/Button.svelte"
  import EmployeeFields from "$lib/components/forms/entity/EmployeeFields.svelte"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"

  // The hub's anchor: the one required record. Starts expanded on a fresh
  // draft; collapses to a one-line card once saved.
  let fields: EmployeeFields
  let expanded = $employeeInfo.validated !== true

  const save = async () => {
    const isValid = await fields.validate()
    employeeInfo.setValidated(isValid)
    if (isValid) {
      expanded = false
    }
  }

  $: displayName =
    [$employeeInfo.firstName, $employeeInfo.lastName].filter(Boolean).join(" ") ||
    capital($_("employee", { values: { n: 1 } }))
  $: cprMasked = $employeeInfo.cprNumber?.cpr_no
    ? `${$employeeInfo.cprNumber.cpr_no.trim().slice(0, 6)}-····`
    : "—"
</script>

<div class="bg-base-200 rounded-sm">
  <div class="flex items-center gap-3 px-4 py-3">
    <div class="flex-1 min-w-0">
      <div class="text-sm font-semibold truncate">{displayName}</div>
      <div class="text-xs text-base-content/60">
        {capital($_("cpr_number"))}: {cprMasked}
      </div>
    </div>
    {#if $employeeInfo.validated === true}
      <span class="badge badge-success badge-sm">{capital($_("complete"))}</span>
    {:else}
      <span class="badge badge-warning badge-sm">{capital($_("incomplete"))}</span>
    {/if}
    <button
      type="button"
      class="btn btn-xs btn-ghost"
      on:click={() => (expanded = !expanded)}
    >
      {expanded ? capital($_("collapse")) : capital($_("edit"))}
    </button>
  </div>
  {#if expanded}
    <div class="border-t border-base-300 p-6">
      <EmployeeFields bind:value={$employeeInfo} bind:this={fields} />
      <div class="flex gap-3 pt-2">
        <Button type="button" title={capital($_("save"))} on:click={save} />
      </div>
    </div>
  {/if}
</div>
