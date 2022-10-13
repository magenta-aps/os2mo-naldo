<script lang="ts">
  import { page } from "$app/stores"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import CopyToClipboard from "$lib/components/copy_to_clipboard.svelte"
  import { activeOrgTab } from "$lib/stores/tab"
  import { base } from "$app/paths"
  import { load } from "./data"

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

{#await load($page.params.uuid)}
  <div class="px-10">
    <p class="py-5">Loader organisation...</p>
  </div>
{:then data}
  <div class="px-10">
    <Breadcrumbs currentOrg={data.name} />
    <div class="flex gap-5">
      <h1 class="pb-4">{data.name}</h1>
      <CopyToClipboard uuid={$page.params.uuid} name={data.name} />
    </div>
    <Tabs {activeItem} {items} on:tabChange={tabChange} />
    {#if activeItem === "Enhed"}
      <DetailTable
        headers={["Enhed", "Enhedstype", "Enhedsniveau", "Overenhed", "Dato"]}
      >
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <td class="p-4">{data.name}</td>
          <td class="p-4">{data.unit_type ? data.unit_type.name : "Ikke sat"}</td>
          <td class="p-4"
            >{data.org_unit_level ? data.org_unit_level.name : "Ikke sat"}</td
          >
          {#if data.parent}
            <a href="{base}/organisation/{data.parent.uuid}">
              <td class="p-4">{data.parent.name}</td>
            </a>
          {:else}
            <td class="p-4">Ingen overenhed</td>
          {/if}
          <ValidityTableCell validity={data.validity} />
        </tr>
      </DetailTable>
    {:else if activeItem === "Adresser"}
      <DetailTable headers={["Adressetype", "Adresse", "Synlighed", "Dato"]}>
        {#each data.addresses as address}
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
      <DetailTable headers={["Navn", "Stillingbetegnelse", "Engagementstype", "Dato"]}>
        {#each data.engagements as engagement}
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
      <DetailTable headers={["Navn", "Tilknytningsrolle", "Stedfortræder", "Dato"]}>
        {#each data.associations as association}
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
      <DetailTable headers={["IT system", "Kontornavn", "Dato"]}>
        {#each data.itusers as ituser}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
            <td class="p-4">{ituser.itsystem.name}</td>
            <td class="p-4">{ituser.user_key}</td>
            <ValidityTableCell validity={ituser.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "Roller"}
      <DetailTable headers={["Navn", "Rolletype", "Dato"]}>
        {#each data.roles as role}
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
      <DetailTable
        headers={["Navn", "Lederansvar", "Ledertype", "Lederniveau", "Dato"]}
      >
        {#each data.managers as manager}
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
      TODO
    {:else if activeItem === "Relateret"}
      TODO
    {/if}
  </div>
{/await}
