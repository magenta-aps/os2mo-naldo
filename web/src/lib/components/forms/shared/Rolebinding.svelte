<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { date } from "$lib/stores/date"
  import Icon from "@iconify/svelte"
  import removeRounded from "@iconify/icons-material-symbols/remove-rounded"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"

  export let rolebinding
  export let index: number
  export let itSystemRoles
</script>

<div class="flex flex-row gap-6">
  <Select
    bind:value={rolebinding.role}
    id={`it-system-role-uuid-${index}`}
    title="Role"
    iterable={itSystemRoles}
    errors={rolebinding.validated ? [] : ["ERORR"]}
    extra_classes="flex-grow"
  />
</div>
