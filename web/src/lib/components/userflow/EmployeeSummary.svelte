<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
</script>

<div>
  <h3 class="pb-2 text-primary">{capital($_("employee", { values: { n: 1 } }))}</h3>
  <dl class="grid gap-1">
    <div class="grid grid-cols-2">
      <dt>{capital($_("cpr_number"))}:</dt>
      {#if $employeeInfo.validated === true}
        <dd>{$employeeInfo.cprNumber.cpr_no.trim().slice(0, 6)}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("givenname", { values: { n: 2 } }))}:</dt>
      {#if $employeeInfo.validated === true}
        <dd>{$employeeInfo.firstName}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("surname", { values: { n: 2 } }))}:</dt>
      {#if $employeeInfo.validated === true}
        <dd>{$employeeInfo.lastName}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("nickname_givenname", { values: { n: 2 } }))}:</dt>
      {#if $employeeInfo.validated === true}
        <dd>{$employeeInfo.nicknameFirstname}</dd>
      {/if}
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("nickname_surname", { values: { n: 2 } }))}:</dt>
      {#if $employeeInfo.validated === true}
        <dd>{$employeeInfo.nicknameLastname}</dd>
      {/if}
    </div>
  </dl>
</div>
