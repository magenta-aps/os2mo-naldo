<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import EmployeeNavbar from "$lib/components/employee/employee_navbar.svelte"
</script>

<EmployeeNavbar />
<slot />
