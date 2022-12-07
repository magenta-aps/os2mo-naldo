<script lang="ts">
  import { page } from "$app/stores"
  import type { PageData } from "./$types"

  export let data: PageData
</script>

<div class="m-12">
  <h1>Organisation</h1>

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
          {#each org_unit.objects[0].addresses.sort((a, b) => (a.address_type.name > b.address_type.name)) as address}
          <div class="flex">
              <span class="inline-block min-w-[10rem]">{address.address_type.name}</span>
              <span>{address.name}</span>
            </div>
          {/each}

          <h3 class="mt-7">Underenheder</h3>
          <div>
            {#each org_unit.objects[0].children.sort((a, b) => (a.name > b.name)) as child, i}
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
</div>
