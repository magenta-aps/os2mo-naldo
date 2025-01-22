<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { tenseToValidity, tenseFilter } from "$lib/util/helpers"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { AddressDocument, type AddressQuery } from "./query.generated"
  import { onMount } from "svelte"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/util/helpers"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$env/dynamic/public"

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  type Addresses = AddressQuery["addresses"]["objects"][0]["validities"]
  let data: Addresses

  gql`
    query Address(
      $org_unit: [UUID!]
      $employee: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      addresses(
        filter: {
          org_units: $org_unit
          employees: $employee
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          validities {
            name
            uuid
            user_key
            value
            address_type {
              name
            }
            visibility {
              name
            }
            validity {
              from
              to
            }
          }
        }
      }
    }
  `

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(AddressDocument, {
      org_unit: org_unit,
      employee: employee,
      ...tenseToValidity(tense, $date),
    })
    const addresses: Addresses = []

    // Filters and flattens the data
    for (const outer of res.addresses.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      addresses.push(...filtered)
    }
    data = addresses
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as address, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
      p-4 leading-5 border-t border-slate-300 text-secondary"
    >
      <td class="text-sm p-4">{address.address_type.name}</td>
      <td class="text-sm p-4"
        >{address.user_key !== address.value && address.user_key !== address.uuid
          ? address.user_key
          : ""}</td
      >
      <td class="text-sm p-4">{address.name}</td>
      <td class="text-sm p-4"
        >{address.visibility ? address.visibility.name : capital($_("not_set"))}</td
      >
      <ValidityTableCell validity={address.validity} />
      {#if env.PUBLIC_AUDITLOG === "true"}
        <td>
          <a href={`${base}/auditlog/${address.uuid}`}>
            <Icon icon={historyRounded} width="25" height="25" />
          </a>
        </td>
      {/if}
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/edit/address/{address.uuid}{formatQueryDates(address.validity)}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/terminate/address/{address.uuid}"
          class="hover:slate-300"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("address", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
