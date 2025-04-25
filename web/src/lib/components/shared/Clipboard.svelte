<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { success } from "$lib/stores/alert"
  import Button from "$lib/components/shared/Button.svelte"
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
  <Button
    outline={true}
    onClick={copyToClipboard}
    icon={fileCopyOutlineRounded}
    width="20"
    height="20"
  />
</div>
