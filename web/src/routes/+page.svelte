<script lang="ts">
  import { _ } from "svelte-i18n"
  import { base } from "$app/paths"
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

<div class="flex flex-row px-12 pt-6 gap-20">
  <div class="basis-9/12">
    <h1 class="mb-10">
      {$_("welcome_message")}
    </h1>
    <!-- This image needs to be remade, right now it's smaller than how we use it, which means it might pixelate -->
    <img class="w-full" src={indexPageImage} alt="velkommen tilbage til os2mo" />
  </div>
  <div class="card basis-3/12 bg-slate-100 rounded-lg">
    <div class="card-body">
      <div>
        <h3 class="text-lg">{$_("employee")}</h3>
        <ul class="menu p-0">
          <li>
            <a href="{base}/employee/create" class="hover:no-underline">
              {$_("navigation.create_employee")}</a
            >
          </li>
          <li>
            <a href="{base}/employee/create/leave" class="hover:no-underline">
              {$_("navigation.leave")}</a
            >
          </li>
          <li>
            <a href="{base}/employee/move" class="hover:no-underline">
              {$_("navigation.move_engagement")}</a
            >
          </li>
          <li>
            <a href="{base}/employee/terminate" class="hover:no-underline">
              {$_("navigation.terminate_employee")}</a
            >
          </li>
        </ul>
      </div>
      <div>
        <h3 class="mt-2 text-lg">{$_("organisation")}</h3>
        <ul class="menu p-0">
          <li>
            <a href="{base}/organisation/create" class="hover:no-underline">
              {$_("navigation.create_unit")}</a
            >
          </li>
          <li>
            <a href="{base}/organisation/rename" class="hover:no-underline">
              {$_("navigation.create_unit")}</a
            >
          </li>
          <li>
            <a href="{base}/organisation/move" class="hover:no-underline">
              {$_("navigation.move_unit")}</a
            >
          </li>
          <li>
            <a href="{base}/organisation/terminate" class="hover:no-underline">
              {$_("navigation.terminate_unit")}</a
            >
          </li>
          <li>
            <a href="{base}/connecting_organisations" class="hover:no-underline">
              {$_("navigation.connecting_organisations")}</a
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
