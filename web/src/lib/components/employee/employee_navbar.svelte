<script lang="ts">
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import personAddOutlineRounded from "@iconify/icons-material-symbols/person-add-outline-rounded"
  import personCancelOutlineRounded from "@iconify/icons-material-symbols/person-cancel-outline-rounded"
  import personRaisedHandOutlineRounded from "@iconify/icons-material-symbols/person-raised-hand-outline-rounded"
  import personAlertOutlineRounded from "@iconify/icons-material-symbols/person-alert-outline-rounded"
  import swapHorizRounded from "@iconify/icons-material-symbols/swap-horiz-rounded"

  enum Form {
    CREATE = "create",
    MOVE = "move",
    TERMINATE = "terminate",
  }
</script>

<div class="navbar bg-primary min-h-0 text-base-100">
  <div class="flex-1">
    <a
      href="{base}/employee/{Form.CREATE}"
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <Icon icon={personAddOutlineRounded} width="20" height="20" />
      <p class="text-base-100">Ny medarbejder</p>
    </a>
    <a
      href={`${base}/employee/${Form.CREATE}/leave/${
        $page.params.uuid ? `#uuid=${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <Icon icon={personAlertOutlineRounded} width="20" height="20" />
      <p class="text-base-100">Orlov</p>
    </a>
    <a
      href={`${base}/employee/${Form.MOVE}${
        $page.params.uuid ? `#uuid=${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <Icon icon={swapHorizRounded} width="20" height="20" />
      <p class="text-base-100">Flyt engagement</p>
    </a>
    <a
      href={`${base}/employee/${Form.TERMINATE}${
        $page.params.uuid ? `#uuid=${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <Icon icon={personCancelOutlineRounded} width="20" height="20" />
      <p class="text-base-100">Opsig medarbejder</p>
    </a>
  </div>
</div>
