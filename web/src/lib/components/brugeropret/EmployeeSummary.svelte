<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
</script>

<div>
  <h2 class="pb-2">{capital($_("employee", { values: { n: 1 } }))}</h2>
  Cpr?
  <dl class="grid gap-1">
    <div class="grid grid-cols-2">
      <dt>{capital($_("givenname", { values: { n: 2 } }))}:</dt>
      <dd>{$employeeInfo.firstName}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("surname", { values: { n: 2 } }))}:</dt>
      <dd>{$employeeInfo.lastName}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("nickname_givenname", { values: { n: 2 } }))}:</dt>
      <dd>{$employeeInfo.nicknameFirstname}</dd>
    </div>
    <div class="grid grid-cols-2">
      <dt>{capital($_("nickname_surname", { values: { n: 2 } }))}:</dt>
      <dd>{$employeeInfo.nicknameLastname}</dd>
    </div>
  </dl>
</div>
