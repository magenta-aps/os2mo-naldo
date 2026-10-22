<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import ActiveToggle from "$lib/components/forms/shared/ActiveToggle.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import type { SubmitFunction } from "./$types"
  import {
    RolebindingRuleDocument,
    UpdateRolebindingRuleDocument,
  } from "./query.generated"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  gql`
    query RolebindingRule($uuid: UUID!, $date: DateTime!) {
      rolebinding_rules(filter: { uuids: [$uuid] }) {
        objects {
          current {
            name
            active
            expression
            role {
              uuid
              current(at: $date) {
                name
                it_system_response {
                  uuid
                  current(at: $date) {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }

    mutation UpdateRolebindingRule($input: RolebindingRuleUpdateInput!) {
      rolebinding_rule_update(input: $input) {
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
              UpdateRolebindingRuleDocument,
              { input: result.data }
            )
            $success = {
              message: capital(
                $_("success_edit_item", {
                  values: {
                    item: $_("rule", { values: { n: 0 } }),
                    name: mutation.rolebinding_rule_update.current.name,
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
  const expression = field("expression", "", [required()])
  const svelteForm = form(name, expression)
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("rule", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("rule", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( RolebindingRuleDocument, { uuid: $page.params.rule, date: $date } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const rule = data.rolebinding_rules.objects[0].current}
  {@const role = rule.role}
  {@const itSystem = role.current?.it_system_response}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <Input
          title={capital($_("rule_name"))}
          id="name"
          bind:value={$name.value}
          startValue={rule.name}
          errors={$name.errors}
          required={true}
        />
        <ActiveToggle id="active" checked={rule.active} />

        <div class="divider p-0 m-0 my-2 w-full" />

        <Select
          title={capital($_("it_system"))}
          id="it-system-uuid"
          startValue={itSystem
            ? { uuid: itSystem.uuid, name: itSystem.current?.name ?? itSystem.uuid }
            : undefined}
          disabled
        />

        <div class="divider p-0 m-0 my-2 w-full" />

        <Select
          title={capital($_("role", { values: { n: 1 } }))}
          id="role-uuid"
          startValue={{ uuid: role.uuid, name: role.current?.name ?? role.uuid }}
          disabled
        />
        <TextArea
          title={capital($_("cel_expression"))}
          id="expression"
          bind:value={$expression.value}
          startValue={rule.expression}
          errors={$expression.errors}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
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
{/await}
