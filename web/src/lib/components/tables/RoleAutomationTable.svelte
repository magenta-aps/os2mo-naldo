<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { RoleAutomationDocument } from "./query.generated"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { base } from "$app/paths"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"

  gql`
    query RoleAutomation($date: DateTime!) {
      rolebinding_rules {
        objects {
          uuid
          current {
            name
            active
            role {
              uuid
              current(at: $date) {
                name
                it_system_response {
                  uuid
                  current(at: $date) {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  $: dataPromise = graphQLClient()
    .request(RoleAutomationDocument, { date: $date })
    .then((res) => res.rolebinding_rules.objects)
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  {#each sortData(data, $sortKey, $sortDirection) as rule, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'}
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">{rule.current.name}</td>
      <td class="text-sm p-4"
        >{rule.current.role.current?.it_system_response?.current?.name ?? ""}</td
      >
      <td class="text-sm p-4"
        >{rule.current.role.current?.name ?? rule.current.role.uuid}</td
      >
      <td class="text-sm p-4"
        >{capital($_(rule.current.active ? "active" : "inactive"))}</td
      >
      <td class="flex p-4 gap-2 justify-end">
        <a href="{base}/admin/role-automation/{rule.uuid}/edit">
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("rule", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{:catch}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("load_error"))}</td>
  </tr>
{/await}
