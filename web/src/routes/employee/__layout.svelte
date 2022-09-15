<script lang="ts">
  import EmployeeNavbar from "$lib/components/employee/employee_navbar.svelte"
</script>

<EmployeeNavbar />

<div class="overflow-auto">
  <slot />
</div>
