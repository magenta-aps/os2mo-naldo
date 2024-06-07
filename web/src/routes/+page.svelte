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

<div class="flex flex-row px-12 pt-10 gap-20">
  <div class="basis-9/12">
    <h1 class="mb-2 text-primary text-center">
      {$_("welcome_message")}
    </h1>
    <h3 class="mb-4 text-secondary text-center font-bold">
      {$_("mo")}
    </h3>
    <img class="w-9/12 mx-auto" src={indexPageImage} alt={$_("welcome_message")} />
    {#await graphQLClient().request(VersionDocument)}
      <div class="">Henter version</div>
    {:then data}
      <div class="text-center p-5">
        <p>
          OS2mo version: {data.version.mo_version}
        </p>
        <p>
          OS2mo-frontend version: {env.PUBLIC_COMMIT_TAG}
        </p>
      </div>
    {/await}
  </div>
  <div class="card basis-4/12 bg-primary rounded-lg">
    <div class="card-body">
      <div>
        <h2 class="font-bold text-white pb-4">{$_("quick_actions")}</h2>
        <h3 class="text-lg text-white">
          {capital($_("employee", { values: { n: 1 } }))}
        </h3>
        <ul class="menu px-0">
          <li>
            <a href="{base}/organisation/create" class="text-white hover:no-underline">
              <Icon icon={personAddOutlineRounded} width="20" height="20" />
              <p class="text-base-100">{$_("navigation.create_employee")}</p>
            </a>
          </li>
          <li>
            <a
              href="{base}/employee/create/leave"
              class="text-white hover:no-underline"
            >
              <Icon icon={personAlertOutlineRounded} width="20" height="20" />
              <p class="text-base-100">{$_("navigation.leave")}</p>
            </a>
          </li>
          <li>
            <a href="{base}/employee/move" class="text-white hover:no-underline">
              <Icon icon={swapHorizRounded} width="20" height="20" />
              <p class="text-base-100">{$_("navigation.move_engagement")}</p></a
            >
          </li>
          <li>
            <a href="{base}/employee/terminate" class="text-white hover:no-underline">
              <Icon icon={personCancelOutlineRounded} width="20" height="20" />
              <p class="text-base-100">{$_("navigation.terminate_employee")}</p></a
            >
          </li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg text-white">{capital($_("organisation"))}</h3>
        <ul class="menu px-0">
          <li>
            <a href="{base}/organisation/create" class="text-white hover:no-underline">
              <Icon icon={addCircleOutlineRounded} width="20" height="20" />
              <p class="text-base-100">{$_("navigation.create_unit")}</p>
            </a>
          </li>
          <li>
            <a href="{base}/organisation/rename" class="text-white hover:no-underline">
              <Icon icon={editSquareOutlineRounded} width="20" height="20" />
              <p class="text-base-100">{$_("navigation.rename_unit")}</p></a
            >
          </li>
          <li>
            <a href="{base}/organisation/move" class="text-white hover:no-underline">
              <Icon icon={swapHorizRounded} width="20" height="20" />
              <p class="text-base-100">{$_("navigation.move_unit")}</p></a
            >
          </li>
          <li>
            <a
              href="{base}/organisation/terminate"
              class="text-white hover:no-underline"
            >
              <Icon icon={cancelOutlineRounded} width="20" height="20" />
              <p class="text-base-100">{$_("navigation.terminate_unit")}</p></a
            >
          </li>
          <li>
            <a href="{base}/connections" class="text-white hover:no-underline">
              <Icon icon={link} width="20" height="20" />
              <p class="text-base-100">{$_("navigation.connections")}</p></a
            >
          </li>
        </ul>
      </div>
      <div />
    </div>
  </div>
</div>
