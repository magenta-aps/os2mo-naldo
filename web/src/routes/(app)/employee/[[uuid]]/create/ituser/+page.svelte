<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Error from "$lib/components/alerts/Error.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import {
    CreateItUserDocument,
    CreateItUserAndRolebindingDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import ItuserFields from "$lib/components/forms/entity/ItuserFields.svelte"
  import {
    createDefaultItuserValues,
    type ItuserValues,
  } from "$lib/components/forms/entity/types"

  let values: ItuserValues = createDefaultItuserValues()
  let fields: ItuserFields

  gql`
    mutation CreateItUserAndRolebinding(
      $itUserInput: ITUserCreateInput!
      $rolebindingInput: [RoleBindingCreateInput!]!
      $date: DateTime!
    ) {
      ituser_create(input: $itUserInput) {
        current(at: $date) {
          uuid
          person_response {
            uuid
            current(at: $date) {
              name
            }
          }
          itsystem_response {
            uuid
            current(at: $date) {
              name
            }
          }
        }
      }
      rolebindings_create(input: $rolebindingInput) {
        uuid
      }
    }
    mutation CreateItUser($itUserInput: ITUserCreateInput!, $date: DateTime!) {
      ituser_create(input: $itUserInput) {
        current(at: $date) {
          uuid
          person_response {
            uuid
            current(at: $date) {
              name
            }
          }
          itsystem_response {
            uuid
            current(at: $date) {
              name
            }
          }
        }
      }
    }
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      if (!(await fields.validate())) return
      if (result.type === "success" && result.data) {
        const itUserInput = result.data.itUserInput
        const rolebindingInput = result.data.rolebindingInput
        if (rolebindingInput?.length) {
          try {
            const mutation = await graphQLClient().request(
              CreateItUserAndRolebindingDocument,
              {
                itUserInput: itUserInput,
                rolebindingInput: rolebindingInput,
                date: itUserInput.validity.from,
              }
            )
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("ituser", { values: { n: 0 } }),
                    name: mutation.ituser_create.current?.person_response?.current
                      ?.name,
                  },
                })
              ),
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        } else {
          try {
            const mutation = await graphQLClient().request(CreateItUserDocument, {
              itUserInput: itUserInput,
              date: itUserInput.validity.from,
            })
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("ituser", { values: { n: 0 } }),
                    name: mutation.ituser_create.current?.person_response?.current
                      ?.name,
                  },
                })
              ),
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("ituser", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("ituser", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <div class="p-8">
      <ItuserFields
        bind:value={values}
        bind:this={fields}
        personUuid={$page.params.uuid}
      />
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("ituser", { values: { n: 1 } }) },
        })
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      href="{base}/employee/{$page.params.uuid}"
    />
  </div>
  <Error />
</form>
