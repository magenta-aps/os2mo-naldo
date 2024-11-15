<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { KleDocument, type KleQuery } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/util/helpers"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$env/dynamic/public"

  type KLEs = KleQuery["kles"]["objects"][0]["objects"]
  let data: KLEs

  export let tense: Tense

  const uuid = $page.params.uuid

  gql`
    query Kle($org_unit: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      kles(filter: { org_units: $org_unit, from_date: $fromDate, to_date: $toDate }) {
        objects {
          objects {
            uuid
            kle_number {
              name
              user_key
            }
            kle_aspects {
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
    const res = await graphQLClient().request(KleDocument, {
      org_unit: uuid,
      ...tenseToValidity(tense, $date),
    })

    const kles: KLEs = []

    // Filters and flattens the data
    for (const outer of res.kles.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      kles.push(...filtered)
    }
    data = kles
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as kle}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4">
        <ul>
          {#each kle.kle_aspects as aspect}
            <li>
              • {aspect.name}
            </li>
          {/each}
        </ul>
      </td>
      <td class="text-sm p-4"
        >{`${kle.kle_number.user_key} - ${kle.kle_number.name}`}</td
      >
      <ValidityTableCell validity={kle.validity} />
      {#if env.PUBLIC_AUDITLOG === "true"}
        <td>
          <a href={`${base}/auditlog/${kle.uuid}`}>
            <Icon icon={historyRounded} width="25" height="25" />
          </a>
        </td>
      {/if}
      <td>
        <a
          href="{base}/organisation/{$page.params
            .uuid}/edit/kle/{kle.uuid}{formatQueryDates(kle.validity)}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a href="{base}/organisation/{$page.params.uuid}/terminate/kle/{kle.uuid}">
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("kle", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
