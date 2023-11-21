<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { page } from "$app/stores"
  import { tenses } from "$lib/stores/tenses"
  import TenseEngagement from "$lib/components/shared/detail_tables/tense_engagement.svelte"

  export let uuid: string

  const isOrg = $page.route.id?.startsWith("/organisation")
  const headers = [
    isOrg
      ? { title: "Navn", sortPath: "employee[0].name" }
      : { title: "Enhed", sortPath: "org_unit[0].name" },
    { title: "Stillingsbetegnelse", sortPath: "job_function.name" },
    { title: "Engagementstype", sortPath: "engagement_type.name" },
    { title: "Primær" },
    { title: "Dato", sortPath: "validity.from" },
    { title: "" },
    { title: "" },
  ]
</script>

<DetailTable {headers}>
  {#if $tenses.future}
    <tr>
      <th class="px-4 py-3 text-left font-bold text-secondary bg-slate-200" colSpan={10}
        >Fremtid</th
      >
    </tr>
    <TenseEngagement {uuid} tense="future" />
  {/if}
  {#if $tenses.present}
    <tr>
      <th class="px-4 py-3 text-left font-bold text-secondary bg-slate-200" colSpan={10}
        >Nutid</th
      >
    </tr>
    <TenseEngagement {uuid} tense="present" />
  {/if}
  {#if $tenses.past}
    <tr>
      <th class="px-4 py-3 text-left font-bold text-secondary bg-slate-200" colSpan={10}
        >Fortid</th
      >
    </tr>
    <TenseEngagement {uuid} tense="past" />
  {/if}
</DetailTable>
