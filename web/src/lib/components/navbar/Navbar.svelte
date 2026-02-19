<script lang="ts">
  import { _ } from "svelte-i18n"
  import "$lib/global.css"
  import { base } from "$app/paths"
  import { isAdmin, isAuth } from "$lib/stores/auth"
  import { logoutKeycloak, keycloak } from "$lib/auth/keycloak"
  import NavbarButton from "$lib/components/navbar/NavbarButton.svelte"
  import NavbarThemeToggle from "$lib/components/navbar/NavbarThemeToggle.svelte"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { VersionDocument } from "./query.generated"
  import { capital } from "$lib/utils/helpers"
  import { locale } from "svelte-i18n"
  import { env } from "$lib/env"

  import chevronRightRounded from "@iconify/icons-material-symbols/chevron-right-rounded"
  import homeOutlineRounded from "@iconify/icons-material-symbols/home-outline-rounded"
  import badgeOutlineRounded from "@iconify/icons-material-symbols/badge-outline-rounded"
  import inventory2OutlineRounded from "@iconify/icons-material-symbols/inventory-2-outline-rounded"
  import searchRounded from "@iconify/icons-material-symbols/search-rounded"
  import assignmentOutlineRounded from "@iconify/icons-material-symbols/assignment-outline-rounded"
  import book2OutlineRounded from "@iconify/icons-material-symbols/book-2-outline-rounded"
  import codeRounded from "@iconify/icons-material-symbols/code-rounded"
  import personAddOutlineRounded from "@iconify/icons-material-symbols/person-add-outline-rounded"
  import addCircleOutlineRounded from "@iconify/icons-material-symbols/add-circle-outline-rounded"
  import swapHorizRounded from "@iconify/icons-material-symbols/swap-horiz-rounded"
  import link from "@iconify/icons-material-symbols/link"
  import personOutlineRounded from "@iconify/icons-material-symbols/person-outline-rounded"
  import language from "@iconify/icons-material-symbols/language"
  import logout from "@iconify/icons-material-symbols/logout-rounded"

  gql`
    query Version {
      version {
        mo_version
      }
    }
  `
  let moVersion: string | null | undefined = "Loading..."

  $: if ($isAuth) {
    graphQLClient()
      .request(VersionDocument)
      .then((res) => {
        moVersion = res.version.mo_version
      })
      .catch(() => {
        moVersion = "Error"
      })
  }

  $: fullName = (): string => {
    if (!$isAuth) {
      return `${capital($_("loading"))}...`
    }
    if (keycloak && keycloak.idTokenParsed) {
      return keycloak.idTokenParsed.preferred_username
    }
    return "No Auth"
  }

  const changeLanguage = () => {
    locale.set($locale === "da-DA" ? "en-GB" : "da-DA")
  }
</script>

<div class="drawer-side is-drawer-close:overflow-visible">
  <label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay" />
  <nav
    class="bg-secondary h-full transition-[width] duration-300 ease-in-out
         w-14 is-drawer-open:w-64 flex flex-col justify-between overflow-hidden is-drawer-close:overflow-visible"
    aria-label="Main Navigation"
  >
    <div class="flex-1 overflow-y-auto is-drawer-close:overflow-visible w-full">
      <ul class="menu p-2 gap-1 text-base-content w-full">
        <li class="mb-4 sticky top-0 bg-secondary z-10">
          <NavbarButton
            drawerId="my-drawer-4"
            title="OS2mo"
            tooltip={`OS2mo: ${moVersion} | Frontend: ${env.PUBLIC_COMMIT_TAG}`}
            icon={chevronRightRounded}
            rotateWhenOpen={true}
          />
        </li>

        <li>
          <NavbarButton
            title={capital($_("home"))}
            href="{base}/"
            icon={homeOutlineRounded}
          />
        </li>

        {#if env.PUBLIC_ONBOARDING_LINK}
          <li>
            <NavbarButton
              title={capital($_("onboarding"))}
              href="{base}/userflow"
              icon={badgeOutlineRounded}
            />
          </li>
        {/if}

        {#if $isAdmin}
          {#if env.PUBLIC_SHOW_ADMIN_PANEL}
            <li>
              <NavbarButton
                title={capital($_("classifications"))}
                href="{base}/admin"
                icon={inventory2OutlineRounded}
              />
            </li>
          {/if}
          {#if env.PUBLIC_SHOW_INSIGHTS}
            <li>
              <NavbarButton
                title={capital($_("insights"))}
                href="{base}/insights"
                icon={searchRounded}
              />
            </li>
          {/if}
        {/if}

        <li>
          <NavbarButton
            title={capital($_("report", { values: { n: 2 } }))}
            href="{base}/reports"
            icon={assignmentOutlineRounded}
          />
        </li>

        {#if env.PUBLIC_NAVLINKS.length}
          {#each env.PUBLIC_NAVLINKS as link}
            <li>
              <NavbarButton
                title={link.text}
                href={link.href}
                icon="material-symbols:graph-2"
                external
              />
            </li>
          {/each}
        {/if}

        {#if env.PUBLIC_DOCS_LINK}
          <li>
            <NavbarButton
              title={capital($_("documentation"))}
              href="https://rammearkitektur.docs.magenta.dk/os2mo/home/manual.html"
              icon={book2OutlineRounded}
              external
            />
          </li>
        {/if}
        <li>
          <NavbarButton
            title={$_("graphql")}
            href="{env.PUBLIC_BASE_URL}/graphql"
            icon={codeRounded}
            external
          />
        </li>

        <div
          class="divider before:bg-accent/50 after:bg-accent/50 opacity-50 before:h-[0.0625rem] after:h-[0.0625rem] p-0 m-0"
        />
        <h2
          class="menu-title text-xs font-bold uppercase text-accent/50 is-drawer-close:hidden"
        >
          {capital($_("actions"))}
        </h2>

        <li>
          <NavbarButton
            title={$_("navigation.create_employee")}
            href="{base}/employee/create/employee"
            icon={personAddOutlineRounded}
          />
        </li>
        <li>
          <NavbarButton
            title={$_("navigation.create_unit")}
            href="{base}/organisation/create/unit"
            icon={addCircleOutlineRounded}
          />
        </li>
        <li>
          <NavbarButton
            title={$_("navigation.move_engagements")}
            href="{base}/organisation/move/engagements"
            icon={swapHorizRounded}
          />
        </li>
        <li>
          <NavbarButton
            title={$_("navigation.connections")}
            href="{base}/connections"
            icon={link}
          />
        </li>
      </ul>
    </div>

    <div class="flex-none w-full bg-secondary">
      <ul class="menu p-2 gap-1 text-base-content w-full">
        <div
          class="divider before:bg-accent/50 after:bg-accent/50 opacity-50 before:h-[0.0625rem] after:h-[0.0625rem] p-0 m-0"
        />
        <h2
          class="menu-title text-xs font-bold uppercase text-accent/50 is-drawer-close:hidden"
        >
          {capital($_("account"))}
        </h2>

        <li>
          <NavbarButton
            title={fullName()}
            drawerId="my-drawer-4"
            icon={personOutlineRounded}
          />
        </li>
        <li>
          <NavbarButton
            title={$locale === "en-GB" ? "Dansk" : "English"}
            on:click={changeLanguage}
            icon={language}
          />
        </li>
        {#if env.PUBLIC_ENABLE_THEMING}
          <li>
            <NavbarThemeToggle title={capital($_("theme"))} />
          </li>
        {/if}
        <li>
          <NavbarButton
            title={capital($_("logout"))}
            on:click={logoutKeycloak}
            icon={logout}
          />
        </li>
      </ul>
    </div>
  </nav>
</div>
