<script lang="ts">
  import { page } from "$app/stores"
  import OrgTable from "$lib/components/org/org_table.svelte"
  import { fetchGraph } from "$lib/util/http"

  let currentTab = 0
  const menuItems = [
    "Enhed",
    "Adressser",
    "Engagementer",
    "Tilknytninger",
    "IT",
    "Roller",
    "Ledere",
    "KLE-opmærkninger",
    "Relateret",
  ]

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
</script>

{#await fetchOrgGraph(query)}
  <div class="m-auto">
    <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
  </div>
{:then org}
  <div class="flex justify-center pt-10">
    <div class="hero bg-base-200">
      <div class="hero-content text-center">
        <div>
          <h1 class="text-3xl font-bold pb-1">{org.name}</h1>
          <h1 class="text-sm pb-5">
            {#if org.parent.length}
              <i>Placering: {org.parent[0].name}</i>
            {/if}
          </h1>
          <div class="tabs tabs-boxed bg-base-300 flex justify-center">
            {#each menuItems as menuItem, index}
              {#if index == currentTab}
                <a href="" class="tab tab-boxed tab-active">{menuItem}</a>
              {:else}
                <a href="" on:click={() => (currentTab = index)} class="tab tab-boxed"
                  >{menuItem}</a
                >
              {/if}
            {/each}
          </div>
          <div class="py-5">
            <h1>Enhed: {org.name}</h1>
            <h1>Enhedstype: {org.unit_type.name}</h1>
            <h1>Enhedsniveu: {org.org_unit_level.name}</h1>
            <h1>
              Gyldig fra: {new Date(org.validity.from).toUTCString()}
            </h1>
            <h1>
              Gyldig til: {org.validity.to != "null"
                ? "Ingen"
                : new Date(org.validity.from).toUTCString()}
            </h1>
          </div>
        </div>
      </div>
    </div>
  </div>
{:catch error}
  <div class="m-auto px-10">
    <p>{error}</p>
  </div>
{/await}
