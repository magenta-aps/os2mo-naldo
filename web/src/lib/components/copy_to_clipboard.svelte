<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { success } from "$lib/stores/alert"
  import Icon from "@iconify/svelte"
  import fileCopyOutlineRounded from "@iconify/icons-material-symbols/file-copy-outline-rounded"

  export let uuid: string
  export let name: string

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uuid).then(() => {
      $success = { message: `${name} ${$_("copied")}`, type: "clipboard" }
    })
  }
</script>

<div class="tooltip tooltip-bottom" data-tip="{capital($_('copy'))} {name} uuid">
  <button
    on:click={copyToClipboard}
    class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
  >
    <Icon icon={fileCopyOutlineRounded} width="20" height="20" />
  </button>
</div>
