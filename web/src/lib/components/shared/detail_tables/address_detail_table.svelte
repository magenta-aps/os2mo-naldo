<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
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

  export let uuid: string
  export let tense: Tense

  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  type Addresses = AddressQuery["addresses"]["objects"][0]["objects"]
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
          objects {
            name
            uuid
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
    const addressQuery = await graphQLClient().request(AddressDocument, {
      org_unit: org_unit,
      employee: employee,
      ...tenseToValidity(tense, $date),
    })
    const filteredAddresses: Addresses = []

    // Filters and flattens the data
    for (let outer of addressQuery.addresses.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      filteredAddresses.push(...filtered)
    }
    data = filteredAddresses
  })
</script>

<DetailTable
  headers={[
    { title: "Adressetype", sortPath: "address_type.name" },
    { title: "Adresse", sortPath: "name" },
    { title: "Synlighed" },
    { title: "Dato", sortPath: "validity.from" },
    { title: "" },
    { title: "" },
  ]}
>
  {#if !data}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:else}
    {#each data as address}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">{address.address_type.name}</td>
        <td class="p-4">{address.name}</td>
        <td class="p-4">{address.visibility ? address.visibility.name : "Ikke sat"}</td>
        <ValidityTableCell validity={address.validity} />
        <td>
          <a
            href="{base}/{$page.route.id?.split(
              '/'
            )[1]}/{uuid}/edit/address/{address.uuid}"
          >
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a
            href="{base}/{$page.route.id?.split(
              '/'
            )[1]}/{uuid}/terminate/address/{address.uuid}"
            class="hover:slate-300"
          >
            <Icon type="xmark" size="30" />
          </a>
        </td>
      </tr>
    {/each}
  {/if}
</DetailTable>
