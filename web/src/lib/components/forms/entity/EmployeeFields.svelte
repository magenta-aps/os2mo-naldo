<script lang="ts">
  import { _ } from "svelte-i18n"
  import { get } from "svelte/store"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import CprLookup from "$lib/components/forms/shared/CPRLookup.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { isValidCpr } from "$lib/utils/cpr"
  import type { EmployeeValues } from "$lib/components/forms/entity/types"

  // Shared by the employee create route and the userflow wizard; see types.ts.
  export let value: EmployeeValues
  // De-duplicates DOM ids when several instances are mounted (wizard tabs).
  // Only the route (idPrefix="") submits formData, so prefixed names are inert.
  export let idPrefix = ""

  // isValidCpr rather than CPR_PATTERN: it also accepts the dash-separated form.
  const cprValidator = () => (cpr: string) => ({
    valid: isValidCpr(cpr),
    name: "pattern",
  })

  const cprField = field("cpr_number", value.cprNumber?.cpr_no ?? "", [
    required(),
    cprValidator(),
  ])
  const firstNameField = field("first_name", value.firstName, [required()])
  const lastNameField = field("last_name", value.lastName, [required()])
  const svelteForm = form(cprField, firstNameField, lastNameField)

  export const validate = async (): Promise<boolean> => {
    await svelteForm.validate()
    return get(svelteForm).valid
  }

  // Keyed on cpr_no, the one signal that a new lookup landed. Keying on the
  // name instead would wipe a fictional CPR's typed name: `value` is a
  // dependency here and the name inputs' bindings invalidate it per keystroke.
  // Normalised: CPRLookup replaces the seeded `cpr_no: ""` with undefined on
  // mount, which would otherwise read as a change and validate an untouched form.
  let lastCpr = value.cprNumber?.cpr_no ?? ""
  $: if (env.PUBLIC_ENABLE_SP && (value.cprNumber?.cpr_no ?? "") !== lastCpr) {
    lastCpr = value.cprNumber?.cpr_no ?? ""
    // An empty name means a fictional CPR; the blank fields force the user to type one.
    const name = value.cprNumber?.name?.trim() ?? ""
    value.firstName = name ? name.split(" ").slice(0, -1).join(" ") : ""
    value.lastName = name ? name.split(" ").slice(-1).join(" ") : ""
    // Assigning the field validates it, so this only runs on an actual change:
    // syncing unconditionally would mark an untouched form invalid on mount.
    $cprField.value = value.cprNumber?.cpr_no ?? ""
  }
</script>

{#if env.PUBLIC_ENABLE_SP}
  <CprLookup
    title={capital($_("cpr_number"))}
    id="{idPrefix}cpr-number"
    bind:value={value.cprNumber}
    errors={$cprField.errors}
  />
  <!-- If we get a response with empty name property, it means that a fictional CPR-number has been entered. -->
  <!-- Therefore we allow typing a name, rather than making the input read-only. -->
  {#if value.cprNumber && value.cprNumber.name === ""}
    <div class="flex flex-row gap-6">
      <Input
        title={capital($_("givenname", { values: { n: 2 } }))}
        id="{idPrefix}first-name"
        bind:value={value.firstName}
        bind:cprName={$firstNameField.value}
        errors={$firstNameField.errors}
        extra_classes="basis-1/2"
        required={true}
      />
      <Input
        title={capital($_("surname"))}
        id="{idPrefix}last-name"
        bind:value={value.lastName}
        bind:cprName={$lastNameField.value}
        errors={$lastNameField.errors}
        extra_classes="basis-1/2"
        required={true}
      />
    </div>
  {:else}
    <div class="flex flex-row gap-6">
      <Input
        title={capital($_("givenname", { values: { n: 2 } }))}
        id="{idPrefix}first-name"
        bind:value={value.firstName}
        bind:cprName={$firstNameField.value}
        errors={$firstNameField.errors}
        extra_classes="basis-1/2"
        required={true}
        readonly
      />
      <Input
        title={capital($_("surname"))}
        id="{idPrefix}last-name"
        bind:value={value.lastName}
        bind:cprName={$lastNameField.value}
        errors={$lastNameField.errors}
        extra_classes="basis-1/2"
        required={true}
        readonly
      />
    </div>
  {/if}
{:else}
  <Input
    title={capital($_("cpr_number"))}
    id="{idPrefix}cpr-number"
    bind:value={value.cprNumber.cpr_no}
    bind:cprName={$cprField.value}
    errors={$cprField.errors}
    required={true}
  />
  <div class="flex flex-row gap-6">
    <Input
      title={capital($_("givenname", { values: { n: 2 } }))}
      id="{idPrefix}first-name"
      bind:value={value.firstName}
      bind:cprName={$firstNameField.value}
      errors={$firstNameField.errors}
      extra_classes="basis-1/2"
      required={true}
    />
    <Input
      title={capital($_("surname"))}
      id="{idPrefix}last-name"
      bind:value={value.lastName}
      bind:cprName={$lastNameField.value}
      errors={$lastNameField.errors}
      extra_classes="basis-1/2"
      required={true}
    />
  </div>
{/if}
<div class="flex flex-row gap-6">
  <Input
    title={capital($_("nickname_givenname", { values: { n: 2 } }))}
    id="{idPrefix}nickname-first-name"
    bind:value={value.nicknameFirstname}
    extra_classes="basis-1/2"
  />
  <Input
    title={capital($_("nickname_surname"))}
    id="{idPrefix}nickname-last-name"
    bind:value={value.nicknameLastname}
    extra_classes="basis-1/2"
  />
</div>
