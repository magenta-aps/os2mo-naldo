<script lang="ts">
  import indexPageImage from "$lib/assets/index_page_image.png"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { VersionDocument } from "./query.generated"
  import { env } from "$env/dynamic/public"

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

<div class="m-auto">
  <img class="rounded-full" src={indexPageImage} alt="velkommen tilbage til os2mo" />
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
