<script lang="ts">
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import addCircleOutlineRounded from "@iconify/icons-material-symbols/add-circle-outline-rounded"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import swapHorizRounded from "@iconify/icons-material-symbols/swap-horiz-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"

  enum Form {
    CREATE = "create",
    RENAME = "rename",
    MOVE = "move",
    TERMINATE = "terminate",
  }
</script>

<div class="navbar bg-primary min-h-0 text-base-100">
  <div class="flex-1">
    <a
      href={`${base}/organisation/${Form.CREATE}${
        $page.params.uuid ? `#uuid=${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal align-middle"
    >
      <Icon icon={addCircleOutlineRounded} width="20" height="20" />
      <p class="text-base-100">Opret enhed</p>
    </a>
    <a
      href={`${base}/organisation/${Form.RENAME}${
        $page.params.uuid ? `#uuid=${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <Icon icon={editSquareOutlineRounded} width="20" height="20" />
      <p class="text-base-100">Omdøb enhed</p>
    </a>
    <a
      href={`${base}/organisation/${Form.MOVE}${
        $page.params.uuid ? `#uuid=${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <Icon icon={swapHorizRounded} width="20" height="20" />
      <p class="text-base-100">Flyt enhed</p>
    </a>
    <a
      href={`${base}/organisation/${Form.TERMINATE}${
        $page.params.uuid ? `#uuid=${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <Icon icon={cancelOutlineRounded} width="20" height="20" />
      <p class="text-base-100">Afslut enhed</p>
    </a>
  </div>
</div>
