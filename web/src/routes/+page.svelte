<script lang="ts">
  import { base } from "$app/paths"
  import indexPageImage from "$lib/assets/index_page_image.png"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { VersionDocument } from "./query.generated"
  import { env } from "$env/dynamic/public"
  import Icon from "$lib/components/icon.svelte"

  gql`
    query Version {
      version {
        mo_version
      }
    }
  `
</script>

<svelte:head>
  <title>OS2mo</title>
</svelte:head>

<div class="flex flex-row px-12 pt-6 gap-20">
  <div class="basis-9/12">
    <h1 class="mb-10">Velkommen til MO</h1>
    <!-- This image needs to be remade, right now it's smaller than how we use it, which means it might pixelate -->
    <img class="w-full" src={indexPageImage} alt="velkommen tilbage til os2mo" />
  </div>
  <div class="card basis-3/12 bg-slate-100 rounded-lg">
    <div class="card-body">
      <div>
        <h3 class="text-lg">Medarbejder</h3>
        <ul class="menu p-0">
          <li>
            <a href="{base}/employee/create" class="pl-0 hover:no-underline"
              ><Icon type="arrow" size="12" />
              Ny medarbejder</a
            >
          </li>
          <li>
            <a href="{base}/employee/create/leave" class="pl-0 hover:no-underline"
              ><Icon type="arrow" size="12" />
              Orlov</a
            >
          </li>
          <li>
            <a href="{base}/employee/create/leave" class="pl-0 hover:no-underline"
              ><Icon type="arrow" size="12" />
              Flyt engagement</a
            >
          </li>
          <li>
            <a href="{base}/employee/create/terminate" class="pl-0 hover:no-underline"
              ><Icon type="arrow" size="12" />
              Opsig medarbejder</a
            >
          </li>
        </ul>
      </div>
      <div>
        <h3 class="mt-2 text-lg">Organisation</h3>
        <ul class="menu p-0">
          <li>
            <a href="{base}/organisation/create" class="pl-0 hover:no-underline"
              ><Icon type="arrow" size="12" />
              Opret enhed</a
            >
          </li>
          <li>
            <a href="{base}/organisation/rename" class="pl-0 hover:no-underline"
              ><Icon type="arrow" size="12" />
              Omdøb enhed</a
            >
          </li>
          <li>
            <a href="{base}/organisation/move" class="pl-0 hover:no-underline"
              ><Icon type="arrow" size="12" />
              Flyt enhed</a
            >
          </li>
          <li>
            <a href="{base}/organisation/terminate" class="pl-0 hover:no-underline"
              ><Icon type="arrow" size="12" />
              Afslut enhed</a
            >
          </li>
          <li>
            <a href="{base}/connecting_organisations" class="pl-0 hover:no-underline"
              ><Icon type="arrow" size="12" />
              Organisationssammenkobling</a
            >
          </li>
        </ul>
      </div>
      <div />
    </div>
  </div>
  {#await graphQLClient().request(VersionDocument)}
    <div class="absolute bottom-0 right-0">Henter version</div>
  {:then data}
    <div class="absolute bottom-0 right-0 p-5">
      <p>
        OS2mo version: {data.version.mo_version}
      </p>
      <p>
        OS2mo-frontend version: {env.PUBLIC_COMMIT_TAG}
      </p>
    </div>
  {/await}
</div>
