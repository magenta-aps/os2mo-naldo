<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { base } from "$app/paths"
  import indexPageImage from "$lib/assets/index_page_image.svg"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { VersionDocument } from "./query.generated"
  import { env } from "$env/dynamic/public"
  import Icon from "@iconify/svelte"
  import personAddOutlineRounded from "@iconify/icons-material-symbols/person-add-outline-rounded"
  import personCancelOutlineRounded from "@iconify/icons-material-symbols/person-cancel-outline-rounded"
  import personAlertOutlineRounded from "@iconify/icons-material-symbols/person-alert-outline-rounded"
  import swapHorizRounded from "@iconify/icons-material-symbols/swap-horiz-rounded"
  import addCircleOutlineRounded from "@iconify/icons-material-symbols/add-circle-outline-rounded"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import link from "@iconify/icons-material-symbols/link"

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

<div class="grid grid-cols-1 px-4 xl:px-12 pt-10 gap-4 xl:gap-20">
  <!-- Main Content with Welcome Message and Image -->
  <div>
    <h1 class="mb-2 text-primary text-center">
      {$_("welcome_message")}
    </h1>
    <h3 class="mb-4 text-secondary text-center font-bold">
      {$_("mo")}
    </h3>
    <img
      class="mx-auto max-w-screen-sm"
      src={indexPageImage}
      alt={$_("welcome_message")}
    />
  </div>

  <!-- Version Information -->
  <div class="xl:col-span-2 xl:col-start-1 mt-4 xl:mt-0">
    {#await graphQLClient().request(VersionDocument)}
      <div class="lg:text-center p-5">
        <p>Henter version</p>
      </div>
    {:then data}
      <div class="lg:text-center p-5">
        <p>OS2mo version: {data.version.mo_version}</p>
        <p>OS2mo-frontend version: {env.PUBLIC_COMMIT_TAG}</p>
      </div>
    {/await}
  </div>
</div>
