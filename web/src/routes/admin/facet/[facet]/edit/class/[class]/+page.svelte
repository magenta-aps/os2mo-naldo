<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import type { SubmitFunction } from "./$types"
  import { UpdateClassDocument, ClassDocument } from "./query.generated"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { getMinMaxValidities } from "$lib/util/helpers"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const userKey = field("user_key", "", [required()])
  const name = field("name", "", [required()])
  const svelteForm = form(fromDate, name)

  gql`
    query Class($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      classes(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            name
            facet(filter: { from_date: null, to_date: null }) {
              uuid
              validity {
                from
                to
              }
            }
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation UpdateClass($input: ClassUpdateInput!, $date: DateTime!) {
      class_update(input: $input) {
        current(at: $date) {
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
            const mutation = await graphQLClient().request(UpdateClassDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit", {
                  values: {
                    name: mutation.class_update.current?.name,
                  },
                })
              ),
              type: "admin",
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
    $_("edit_item", {
      values: { item: $_("class", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("class", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( ClassDocument, { uuid: $page.params.class, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to") } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  {capital($_("loading"))}
{:then data}
  {@const cls = data.classes.objects[0].validities[0]}
  {@const validities = getMinMaxValidities(data.classes.objects[0].validities)}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={toDate ? toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={cls.validity.to ? cls.validity.to.split("T")[0] : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Input
            title={capital($_("name"))}
            id="name"
            bind:value={$name.value}
            startValue={cls.name}
            errors={$name.errors}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            title={capital($_("user_key"))}
            id="user-key"
            bind:value={$userKey.value}
            startValue={cls.user_key}
            errors={$userKey.errors}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("edit_item", {
            values: { item: $_("class", { values: { n: 1 } }) },
          })
        )}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/admin`)}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  </form>
{/await}
