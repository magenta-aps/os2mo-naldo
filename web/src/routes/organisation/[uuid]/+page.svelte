<script lang="ts">
  import { page } from "$app/stores"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import CopyToClipboard from "$lib/components/copy_to_clipboard.svelte"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import { activeOrgTab } from "$lib/stores/tab"
  import { base } from "$app/paths"
  import { load } from "./data"
  import { date } from "$lib/stores/date"
  import UnitDetailTable from "$lib/components/org/tables/unit_detail_table.svelte"
  import { tenses } from "$lib/stores/tenses"
  import Icon from "$lib/components/icon.svelte"
  import OrgTable from "$lib/components/org/org_table.svelte"
  import ItSystemTable from "$lib/components/org/tables/it_system_table.svelte"

  // Tabs
  // TODO: enum?

  let items = [
    "Enhed",
    "Adresser",
    "Engagementer",
    "Tilknytninger",
    "IT",
    "Roller",
    "Ledere",
    "KLE-opmærkninger",
    "Relateret",
  ]

  let activeItem: string = $activeOrgTab
  const tabChange = (e: CustomEvent) => ($activeOrgTab = activeItem = e.detail)
</script>

<HeadTitle type="organization" />

{#await load($page.params.uuid, $date)}
  <div class="px-10">
    <p class="py-5">Loader organisation...</p>
  </div>
{:then orgUnits}
  <div class="px-10">
    <Breadcrumbs currentOrg={orgUnits.present[0].name} uuid={$page.params.uuid} />
    <div class="flex gap-5">
      <h1 class="pb-4">{orgUnits.present[0].name}</h1>
      <CopyToClipboard uuid={$page.params.uuid} name={orgUnits.present[0].name} />
    </div>
    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    {#if activeItem === "Enhed"}
      <div class="flex justify-between">
        <TenseTabs />
        <a
          class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
          href="{$page.url}/create"
        >
          Tilføj enhed
        </a>
      </div>
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        {#if orgUnits.future.length}
          <UnitDetailTable orgUnits={orgUnits.future} />
        {:else}
          <p class="mb-4">Intet at vise</p>
        {/if}
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <UnitDetailTable orgUnits={orgUnits.present} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        {#if orgUnits.past.length}
          <UnitDetailTable orgUnits={orgUnits.past} />
        {:else}
          <p>Intet at vise</p>
        {/if}
      {/if}
    {:else if activeItem === "Adresser"}
      <TenseTabs />
      <DetailTable headers={["Adressetype", "Adresse", "Synlighed", "Dato"]}>
        {#each orgUnits.present[0].addresses as address}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
            <td class="p-4">{address.address_type.name}</td>
            <td class="p-4">{address.name}</td>
            <td class="p-4"
              >{address.visibility ? address.visibility.name : "Ikke sat"}</td
            >
            <ValidityTableCell validity={address.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "Engagementer"}
      <TenseTabs />
      <DetailTable headers={["Navn", "Stillingbetegnelse", "Engagementstype", "Dato"]}>
        {#each orgUnits.present[0].engagements as engagement}
          <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
            <a href="{base}/employee/{engagement.employee[0].uuid}">
              <td class="p-4">{engagement.employee[0].name}</td>
            </a>
            <td class="p-4">{engagement.job_function.name}</td>
            <td class="p-4">{engagement.engagement_type.name}</td>
            <ValidityTableCell validity={engagement.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "Tilknytninger"}
      <TenseTabs />
      <DetailTable headers={["Navn", "Tilknytningsrolle", "Stedfortræder", "Dato"]}>
        {#each orgUnits.present[0].associations as association}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
            <a href="{base}/employee/{association.employee[0].uuid}">
              <td class="p-4">{association.employee[0].name}</td>
            </a>
            <td class="p-4"
              >{association.association_type
                ? association.association_type.name
                : "Ikke sat"}</td
            >
            <td class="p-4">
              {#if association.substitute.length}
                <ul>
                  {#each association.substitute as substitute}
                    <li>
                      • {substitute.name}
                    </li>
                  {/each}
                </ul>
              {/if}
            </td>
            <ValidityTableCell validity={association.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "IT"}
        <TenseTabs />
      <!-- TODO: Add 'Add'-button -->
      <!-- TODO: future and fast does not work. 
      Waiting to see if this can be done through GraphQL -->
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <ItSystemTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <ItSystemTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <ItSystemTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === "Roller"}
      <TenseTabs />
      <DetailTable headers={["Navn", "Rolletype", "Dato"]}>
        {#each orgUnits.present[0].roles as role}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
            <a href="{base}/employee/{role.employee[0].uuid}">
              <td class="p-4">{role.employee[0].name}</td>
            </a>
            <td class="p-4">{role.role_type.name}</td>
            <ValidityTableCell validity={role.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "Ledere"}
      <TenseTabs />
      <DetailTable
        headers={["Navn", "Lederansvar", "Ledertype", "Lederniveau", "Dato"]}
      >
        {#each orgUnits.present[0].managers as manager}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
            <a href="{base}/employee/{manager.employee[0].uuid}">
              <td class="p-4">{manager.employee[0].name}</td>
            </a>
            <td class="p-4">
              <ul>
                {#each manager.responsibilities as responsibility}
                  <li>
                    • {responsibility.name}
                  </li>
                {/each}
              </ul>
            </td>
            <td class="p-4"
              >{manager.manager_type ? manager.manager_type.name : "Ikke sat"}</td
            >
            <td class="p-4"
              >{manager.manager_level ? manager.manager_level.name : "Ikke sat"}</td
            >
            <ValidityTableCell validity={manager.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "KLE-opmærkninger"}
      <TenseTabs />
      TODO
    {:else if activeItem === "Relateret"}
      <TenseTabs />
      TODO
    {/if}
  </div>
{/await}
