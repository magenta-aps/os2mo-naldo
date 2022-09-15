<script lang="ts">
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import DetailTable from "$lib/components/shared/detail_table.svelte"

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
        }
      }
    }
  `

  const fetchOrgGraph = async (query: string) => {
    const res = await fetchGraph(query)
    const json = await res.json()
    console.log(json.data.org_units[0].objects[0])
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
    "KLE-opmærkninger",
    "Relateret",
    "Ejere",
    "Engagementstilknytninger",
  ]

  let activeItem = items[3]
  const tabChange = (e) => (activeItem = e.detail)
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
        headers={["#", "Enhed", "Enhedstype", "Enhedsniveau", "Overenhed", "Dato"]}
      >
        <tr class="border">
          <td>1</td>
          <td>{org.name}</td>
          <td>{org.unit_type.name}</td>
          <td>{org.org_unit_level.name}</td>
          {#if org.parent[0]}
            <td>{org.parent[0].name}</td>
          {:else}
            <td>Ingen overenhed</td>
          {/if}
          <ValidityTableCell validity={org.validity} />
        </tr>
      </DetailTable>
    {:else if activeItem === "Adresser"}
      <DetailTable headers={["#", "Adressetype", "Adresse", "Dato"]}>
        {#each org.addresses as address, i}
          <tr class="border">
            <td>{i + 1}</td>
            <td>{address.address_type.name}</td>
            <td>{address.name}</td>
            <ValidityTableCell validity={org.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "Engagementer"}
      <DetailTable
        headers={["#", "Navn", "Stillingbetegnelse", "Engagementstype", "Dato"]}
      >
        {#each org.engagements as engagement, i}
          <tr class="border">
            <td>{i + 1}</td>
            <td>{engagement.employee[0].name}</td>
            <!-- TODO: Figure out if we need to have IDs shown -->
            <!-- <td>{engagement.uuid}</td> -->
            <td>{engagement.job_function.name}</td>
            <td>{engagement.engagement_type.name}</td>
            <ValidityTableCell validity={org.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === "Tilknytninger"}
      <DetailTable
        headers={["#", "Navn", "Tilknytningsrolle", "Stedfortræder", "Dato"]}
      >
        {#each org.associations as association, i}
          <tr class="border">
            <td>{i + 1}</td>
            <td>{association.employee[0].name}</td>
            <!-- <td>{engagement.uuid}</td> -->
            <td>{association.association_type.name}</td>
            {#if association.substitute.length !== 0}
              <td>{association.substitute.name}</td>
            {:else}
              <td />
            {/if}
            <ValidityTableCell validity={org.validity} />
          </tr>
        {/each}
      </DetailTable>
    {/if}
  {:catch error}
    <div class="m-auto px-10">
      <p>{error}</p>
    </div>
  {/await}
</div>
