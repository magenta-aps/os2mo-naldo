<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Icon from "@iconify/svelte"
  import closeRounded from "@iconify/icons-material-symbols/close-rounded"

  export let roles: string[]
  export let disabled = false

  let input = ""

  const add = () => {
    const role = input.trim()
    if (role && !roles.includes(role)) roles = [...roles, role]
    input = ""
  }
</script>

{#if !disabled}
  <!-- Enter adds the role instead of submitting the form -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="flex items-end gap-4"
    on:keydown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        add()
      }
    }}
  >
    <Input
      title={capital($_("role", { values: { n: 2 } }))}
      id="policy-role"
      bind:value={input}
      info={capital($_("policy_roles_help"))}
      extra_classes="flex-1"
    />
    <div class="pb-4">
      <Button
        type="button"
        outline={true}
        title={capital($_("policy_add_role"))}
        on:click={add}
      />
    </div>
  </div>
{:else}
  <span class="text-sm pb-1">{capital($_("role", { values: { n: 2 } }))}</span>
{/if}

<ul
  class="flex flex-wrap gap-2 pb-3"
  aria-label={capital($_("role", { values: { n: 2 } }))}
>
  {#each roles as role (role)}
    <li class="badge badge-primary badge-outline gap-1 font-mono">
      {role}
      {#if !disabled}
        <button
          type="button"
          class="cursor-pointer"
          aria-label={capital($_("policy_remove_role", { values: { role } }))}
          on:click={() => (roles = roles.filter((r) => r !== role))}
        >
          <Icon icon={closeRounded} width="14" height="14" />
        </button>
      {/if}
    </li>
  {:else}
    <li class="text-sm text-warning">{capital($_("policy_no_roles"))}</li>
  {/each}
</ul>
