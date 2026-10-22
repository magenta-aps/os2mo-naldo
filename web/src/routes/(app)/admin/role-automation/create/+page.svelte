<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital, formatITSystemNames } from "$lib/utils/helpers"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import ActiveToggle from "$lib/components/forms/shared/ActiveToggle.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import type { SubmitFunction } from "./$types"
  import {
    CreateRolebindingRuleDocument,
    RoleAutomationItSystemsDocument,
  } from "./query.generated"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { createQuery } from "$lib/http/query"
  import { getRoleClasses } from "$lib/http/getClasses"
  import { filterClassesByFacetUserKey, type FacetValidities } from "$lib/utils/classes"

  gql`
    query RoleAutomationItSystems($currentDate: DateTime!) {
      itsystems {
        objects {
          current(at: $currentDate) {
            name
            uuid
            user_key
          }
        }
      }
    }

    mutation CreateRolebindingRule($input: RolebindingRuleCreateInput!) {
      rolebinding_rule_create(input: $input) {
        current {
          name
        }
      }
    }
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(
              CreateRolebindingRuleDocument,
              { input: result.data }
            )
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("rule", { values: { n: 0 } }),
                    name: mutation.rolebinding_rule_create.current.name,
                  },
                })
              ),
              type: "role_automation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  const name = field("name", "", [required()])
  const itSystemField = field("it_system", "", [required()])
  const roleField = field("role", "", [required()])
  const expression = field("expression", "", [required()])
  const svelteForm = form(name, itSystemField, roleField, expression)

  let itSystem: { uuid: string | null; name: string } | undefined

  const itSystems = createQuery<{ uuid: string; name: string }[]>()
  $: itSystems.run(async (signal) => {
    const res = await graphQLClient(signal).request(RoleAutomationItSystemsDocument, {
      currentDate: $date,
    })
    return formatITSystemNames(res.itsystems.objects)
  })

  const facets = createQuery<FacetValidities[]>()
  $: if (itSystem?.uuid) {
    const itSystemUuid = itSystem.uuid
    facets.run((signal) =>
      getRoleClasses({ fromDate: $date, itSystem: itSystemUuid }, signal)
    )
  }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("rule", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("rule", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <div class="p-8">
      <Input
        title={capital($_("rule_name"))}
        id="name"
        bind:value={$name.value}
        errors={$name.errors}
        required={true}
      />
      <ActiveToggle id="active" />

      <div class="divider p-0 m-0 my-2 w-full" />

      {#if $itSystems.error}
        <p class="text-sm text-error">{capital($_("load_error"))}</p>
      {/if}
      <Select
        title={capital($_("it_system"))}
        id="it-system-uuid"
        bind:value={itSystem}
        bind:name={$itSystemField.value}
        errors={$itSystemField.errors}
        iterable={$itSystems.data}
        disabled={$itSystems.error}
        required={true}
        on:change={() => ($roleField.value = "")}
      />

      <div class="divider p-0 m-0 my-2 w-full" />

      {#if $facets.error}
        <p class="text-sm text-error">
          {capital($_($facets.data ? "load_error_options" : "load_error"))}
        </p>
      {/if}
      {#if itSystem?.uuid && $facets.data}
        {#key $facets.data}
          <Select
            title={capital($_("role", { values: { n: 1 } }))}
            id="role-uuid"
            bind:name={$roleField.value}
            errors={$roleField.errors}
            iterable={filterClassesByFacetUserKey($facets.data, "role")}
            disabled={$facets.error}
            required={true}
          />
        {/key}
      {:else}
        <Select
          title={capital($_("role", { values: { n: 1 } }))}
          id="role-uuid"
          bind:name={$roleField.value}
          errors={$roleField.errors}
          required={true}
          disabled
        />
      {/if}
      <TextArea
        title={capital($_("cel_expression"))}
        id="expression"
        bind:value={$expression.value}
        errors={$expression.errors}
        required={true}
      />
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("rule", { values: { n: 1 } }) },
        })
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      href="{base}/admin/role-automation"
    />
  </div>
  <Error />
</form>
