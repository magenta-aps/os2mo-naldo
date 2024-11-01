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

<div class="grid grid-cols-1 xl:grid-cols-3 px-4 xl:px-12 pt-10 gap-4 xl:gap-20">
  <!-- Main Content with Welcome Message and Image -->
  <div class="xl:col-span-2 flex flex-col">
    <h1 class="mb-2 text-primary text-center">
      {$_("welcome_message")}
    </h1>
    <h3 class="mb-4 text-secondary text-center font-bold">
      {$_("mo")}
    </h3>
    <img
      class="w-7/12 xl:w-9/12 mx-auto"
      src={indexPageImage}
      alt={$_("welcome_message")}
    />
  </div>

  <!-- Quick Actions Card -->
  <div class="w-4/5 mx-auto card bg-primary rounded">
    <div class="card-body">
      <h2 class="font-bold text-white pb-4">{$_("quick_actions")}</h2>
      <div class="grid grid-cols-2 xl:grid-cols-1">
        <div>
          <h3 class="text-lg text-white">
            {capital($_("employee", { values: { n: 1 } }))}
          </h3>
          <ul class="menu px-0">
            <li>
              <a
                href="{base}/employee/create/employee"
                class="text-white hover:no-underline flex items-center gap-2"
              >
                <Icon icon={personAddOutlineRounded} width="20" height="20" />
                <span class="text-base-100">{$_("navigation.create_employee")}</span>
              </a>
            </li>
            <li>
              <a
                href="{base}/employee/create/leave"
                class="text-white hover:no-underline flex items-center gap-2"
              >
                <Icon icon={personAlertOutlineRounded} width="20" height="20" />
                <span class="text-base-100">{$_("navigation.leave")}</span>
              </a>
            </li>
            <li>
              <a
                href="{base}/employee/move/engagement"
                class="text-white hover:no-underline flex items-center gap-2"
              >
                <Icon icon={swapHorizRounded} width="20" height="20" />
                <span class="text-base-100">{$_("navigation.move_engagement")}</span>
              </a>
            </li>
            <li>
              <!-- NOTE: `employee/terminate/employee` vs  `employee/terminate` -->
              <!-- /employee gives more structure, but seems redundant, just like `/unit` -->
              <a
                href="{base}/employee/terminate/employee"
                class="text-white hover:no-underline flex items-center gap-2"
              >
                <Icon icon={personCancelOutlineRounded} width="20" height="20" />
                <span class="text-base-100">{$_("navigation.terminate_employee")}</span>
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg text-white">{capital($_("organisation"))}</h3>
          <ul class="menu px-0">
            <li>
              <a
                href="{base}/organisation/create/unit"
                class="text-white hover:no-underline flex items-center gap-2"
              >
                <Icon icon={addCircleOutlineRounded} width="20" height="20" />
                <span class="text-base-100">{$_("navigation.create_unit")}</span>
              </a>
            </li>
            <li>
              <a
                href="{base}/organisation/rename/unit"
                class="text-white hover:no-underline flex items-center gap-2"
              >
                <Icon icon={editSquareOutlineRounded} width="20" height="20" />
                <span class="text-base-100">{$_("navigation.rename_unit")}</span>
              </a>
            </li>
            <li>
              <a
                href="{base}/organisation/move/unit"
                class="text-white hover:no-underline flex items-center gap-2"
              >
                <Icon icon={swapHorizRounded} width="20" height="20" />
                <span class="text-base-100">{$_("navigation.move_unit")}</span>
              </a>
            </li>
            <li>
              <a
                href="{base}/organisation/move/engagements"
                class="text-white hover:no-underline flex items-center gap-2"
              >
                <Icon icon={swapHorizRounded} width="20" height="20" />
                <span class="text-base-100">{$_("navigation.move_engagements")}</span>
              </a>
            </li>
            <li>
              <a
                href="{base}/organisation/terminate/unit"
                class="text-white hover:no-underline flex items-center gap-2"
              >
                <Icon icon={cancelOutlineRounded} width="20" height="20" />
                <span class="text-base-100">{$_("navigation.terminate_unit")}</span>
              </a>
            </li>
            <li>
              <a
                href="{base}/connections"
                class="text-white hover:no-underline flex items-center gap-2"
              >
                <Icon icon={link} width="20" height="20" />
                <span class="text-base-100">{$_("navigation.connections")}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
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
