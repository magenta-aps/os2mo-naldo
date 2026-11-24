<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { PolicySelectorKind } from "$lib/graphql/types"
  import { PoliciesDocument } from "./query.generated"
  import { isAccessDenied } from "$lib/utils/policies"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { base } from "$app/paths"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import visibilityOutlineRounded from "@iconify/icons-material-symbols/visibility-outline-rounded"

  gql`
    query Policies {
      policies {
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
          }
          write_rules {
            mutator
          }
        }
      }
    }
  `

  const dataPromise = graphQLClient()
    .request(PoliciesDocument)
    .then((res) => res.policies.objects)
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  {#each sortData(data, $sortKey, $sortDirection) as policy, i (policy.uuid)}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'}
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        <a href="{base}/admin/policies/{policy.uuid}">{policy.name}</a>
        {#if policy.description}
          <p class="text-xs text-base-content/70">{policy.description}</p>
        {/if}
      </td>
      <td class="text-sm p-4">
        <div class="flex flex-wrap gap-1">
          {#each policy.selectors.filter((s) => s.kind === PolicySelectorKind.Role) as selector}
            <span class="badge badge-sm badge-outline font-mono">{selector.value}</span>
          {/each}
        </div>
      </td>
      <td class="text-sm p-4">
        {$_("policy_read_rules", { values: { n: policy.read_rules.length } })},
        {$_("policy_write_rules", { values: { n: policy.write_rules.length } })}
      </td>
      <td class="text-sm p-4">
        {capital($_(policy.active ? "active" : "inactive"))}
        {#if policy.managed}
          <span class="badge badge-sm badge-ghost ml-1">{$_("policy_managed")}</span>
        {/if}
      </td>
      <td class="flex p-4 gap-2 justify-end">
        <a href="{base}/admin/policies/{policy.uuid}" aria-label={policy.name}>
          <Icon
            icon={policy.managed ? visibilityOutlineRounded : editSquareOutlineRounded}
            width="25"
            height="25"
          />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("policy", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{:catch err}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">
      {capital($_(isAccessDenied(err) ? "policy_no_access" : "load_error"))}
    </td>
  </tr>
{/await}
