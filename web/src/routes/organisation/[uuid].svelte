<script lang="ts">
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { activeOrgTab } from "$lib/stores/tab"

  $: uuid = $page.params.uuid

  $: query = `
    query {
      org_units(uuids: "${uuid}") {
        uuid
        objects {
          name
          unit_type {
            name
          }
          org_unit_level {
            name
          }
          parent {
            name
            parent {
              name
            }
          }
          validity {
            from
            to
          }
          addresses {
            name
            address_type {
              name
            }
            validity {
              from
              to
            }
          }
          engagements {
            job_function {
              name
            }
            engagement_type {
              name
            }
            employee {
              name
            }
            validity {
              from
              to
            }
            uuid
          }
          associations {
            association_type {
              name
            }
            employee {
              name
            }
            substitute {
              name
            }
            validity {
              from
              to
            }
          }
          itusers {
            itsystem {
              name
            }
            validity {
              from
              to
            }
            user_key
          }
          roles {
            employee {
              name
            }
            role_type {
              name
            }
            validity {
              from
              to
            }
          }
          managers {
            employee {
              name
            }
            responsibilities {
              name
            }
            manager_level {
              name
            }
            manager_type {
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

  const fetchOrgGraph = async (query: string) => {
    const res = await fetchGraph(query)
    const json = await res.json()

    if (json.data) {
      return json.data.org_units[0].objects[0]
    } else {
      throw new Error(json.errors[0].message)
    }
  }

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

<div class="px-10">
  <!-- TODO: Implement breadcrumbs -->
  <div class="text-sm py-5 breadcrumbs">
    <ul>
      <li>Organisation</li>
      <li>Kolding Kommune</li>
      <li>Skole og Børn</li>
      <li>Social Indsats</li>
    </ul>
  </div>
  {#await fetchOrgGraph(query)}
    <div class="m-auto">
      <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
    </div>
  {:then org}
    <h1 class="text-2xl pb-4">{org.name}</h1>
    <Tabs {activeItem} {items} on:tabChange={tabChange} />
    {#if activeItem === "Enhed"}
      <DetailTable
        headers={["Enhed", "Enhedstype", "Enhedsniveau", "Overenhed", "Dato"]}
      >
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary text-sm">
          <td class="p-4">{org.name}</td>
          <td class="p-4">{org.unit_type.name}</td>
          <td class="p-4">{org.org_unit_level.name}</td>
          {#if org.parent[0]}
            <td class="p-4">{org.parent[0].name}</td>
          {:else}
            <td class="p-4">Ingen overenhed</td>
          {/if}
          <ValidityTableCell validity={org.validity} />
        </tr>
      </DetailTable>
    {:else if activeItem === "Adresser"}
      <DetailTable headers={["Adressetype", "Adresse", "Dato"]}>
        {#each org.addresses as address, i}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary text-sm">
            <td class="p-4">{address.address_type.name}</td>
            <td class="p-4">{address.name}</td>
            <ValidityTableCell validity={address.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "Engagementer"}
      <DetailTable headers={["Navn", "Stillingbetegnelse", "Engagementstype", "Dato"]}>
        {#each org.engagements as engagement, i}
          <tr class="py-4 leading-5 border-t border-slate-300 text-secondary text-sm">
            <td class="p-4">{engagement.employee[0].name}</td>
            <td class="p-4">{engagement.job_function.name}</td>
            <td class="p-4">{engagement.engagement_type.name}</td>
            <ValidityTableCell validity={engagement.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "Tilknytninger"}
      <DetailTable headers={["Navn", "Tilknytningsrolle", "Stedfortræder", "Dato"]}>
        {#each org.associations as association}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary text-sm">
            <td class="p-4">{association.employee[0].name}</td>
            <td class="p-4">{association.association_type.name}</td>
            {#if association.substitute.length !== 0}
              <td class="p-4">{association.substitute.name}</td>
            {:else}
              <td />
            {/if}
            <ValidityTableCell validity={association.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "IT"}
      <DetailTable headers={["IT system", "Kontornavn", "Dato"]}>
        {#each org.itusers as ituser}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary text-sm">
            <td class="p-4">{ituser.itsystem.name}</td>
            <td class="p-4">{ituser.user_key}</td>
            <ValidityTableCell validity={ituser.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "Roller"}
      <DetailTable headers={["Navn", "Rolletype", "Dato"]}>
        {#each org.roles as role}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary text-sm">
            <td class="p-4">{role.employee[0].name}</td>
            <td class="p-4">{role.role_type.name}</td>
            <ValidityTableCell validity={role.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "Ledere"}
      <DetailTable
        headers={["Navn", "Lederansvar", "Ledertype", "Lederniveau", "Dato"]}
      >
        {#each org.managers as manager}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary text-sm">
            <td class="p-4">{manager.employee[0].name}</td>
            <td class="p-4">
              {#each manager.responsibilities as responsibility}
                {responsibility.name} <br />
              {/each}
            </td>
            <td class="p-4">{manager.manager_type.name}</td>
            <td class="p-4">{manager.manager_level.name}</td>
            <ValidityTableCell validity={manager.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "KLE-opmærkninger"}
      TODO
    {:else if activeItem === "Relateret"}
      TODO
    {/if}
  {:catch error}
    <div class="m-auto px-10">
      <p>{error}</p>
    </div>
  {/await}
</div>
