<script lang="ts">
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { OrgUnitsDocument } from "./query.generated"

  // Will generate an interface with the query name + Document to be used with the client
  gql`
    query OrgUnits($fromDate: DateTime) {
      org_units(parents: null, from_date: $fromDate) {
        objects {
          addresses {
            name
            address_type {
              name
              scope
            }
          }
          name
          uuid
          children {
            name
            uuid
          }
        }
      }
    }
  `
</script>

<div class="m-12">
  <h1>Organisation</h1>

  <!-- Uses the generated version of the query from the script tag -->
  {#await graphQLClient().request(OrgUnitsDocument, { fromDate: $date })}
    <div class="flex items-center justify-center h-screen">
      <div class="m-auto text-center">
        <div
          class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary mb-6"
        />
        <span>Loader organisationer...</span>
      </div>
    </div>
  {:then data}
    <div class="grid xl:grid-cols-2 gap-8 mt-8">
      {#each data.org_units as org_unit}
        <div class="card w-auto bg-slate-100 rounded-lg">
          <div class="card-body">
            <div class="flex justify-between">
              <h2>{org_unit.objects[0].name}</h2>
              <a
                class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
                href="{$page.url}/{org_unit.objects[0].uuid}"
              >
                Gå til enhed
              </a>
            </div>
            <h3 class="mt-7">Kontakt</h3>
            {#each org_unit.objects[0].addresses.sort( (a, b) => a.address_type.name.localeCompare(b.address_type.name) ) as address}
              <div class="flex">
                <span class="inline-block min-w-[12rem] font-bold text-slate-600"
                  >{address.address_type.name}</span
                >
                {#if address.address_type.scope === "EMAIL"}
                  <a href="mailto:{address.name}">{address.name}</a>
                {:else if address.address_type.scope === "WWW"}
                  <a href="https://{address.name}">{address.name}</a>
                {:else if address.address_type.scope === "PHONE"}
                  <a href="tel:{address.name}">{address.name}</a>
                {:else}
                  <span class="text-secondary">{address.name}</span>
                {/if}
              </div>
            {/each}

            <h3 class="mt-7">Underenheder</h3>
            <div>
              {#each org_unit.objects[0].children.sort( (a, b) => a.name.localeCompare(b.name) ) as child, i}
                <!-- For the trailing comma problem -->
                {#if i < org_unit.objects[0].children.length - 1}
                  <span class="inline-block mr-1">
                    <a href="{$page.url}/{child.uuid}">{child.name},</a>
                  </span>
                {:else}
                  <span>
                    <a href="{$page.url}/{child.uuid}">{child.name}</a>
                  </span>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/await}
</div>
