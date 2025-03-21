<script lang="ts">
  import { _ } from "svelte-i18n"
  import { base } from "$app/paths"
  import User from "$lib/components/navbar/User.svelte"
  import NavLinks from "$lib/components/navbar/NavLinks.svelte"
  import SearchBar from "$lib/components/navbar/SearchBar.svelte"
  import Icon from "@iconify/svelte"
  import menuRounded from "@iconify/icons-material-symbols/menu-rounded"
  import personAddOutlineRounded from "@iconify/icons-material-symbols/person-add-outline-rounded"
  import personCancelOutlineRounded from "@iconify/icons-material-symbols/person-cancel-outline-rounded"
  import personAlertOutlineRounded from "@iconify/icons-material-symbols/person-alert-outline-rounded"
  import swapHorizRounded from "@iconify/icons-material-symbols/swap-horiz-rounded"
  import addCircleOutlineRounded from "@iconify/icons-material-symbols/add-circle-outline-rounded"
  import link from "@iconify/icons-material-symbols/link"
</script>

<div class="navbar bg-primary h-4">
  <SearchBar />
</div>
