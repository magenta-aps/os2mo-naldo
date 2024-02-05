<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Input from "$lib/components/forms/shared/input.svelte"
  import type { SubmitFunction } from "./$types"
  import { UpdateClassDocument, ClassDocument } from "./query.generated"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  let toDate: string

  const fromDate = field("from", "", [required()])
  // const userKey = field("user_key", "", [required()])
  const name = field("name", "", [required()])
  const svelteForm = form(fromDate, name)

  gql`
    query Class($uuid: [UUID!], $fromDate: DateTime) {
      classes(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            user_key
            name
            facet_uuid
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation UpdateClass($input: ClassUpdateInput!) {
      class_update(input: $input) {
        objects {
          name
          uuid
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
            })
            $success = {
              message: `Stillingsbetegnelse ${
                mutation.class_update.objects[0]?.name
                  ? `${mutation.class_update.objects[0].name}`
                  : ""
              } er redigeret fra d. ${$fromDate.value}`,
              type: "admin",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

{#await graphQLClient().request( ClassDocument, { uuid: $page.params.class, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const cls = data.classes.objects[0].objects[0]}

  <title>Redigér stillingsbetegnelse | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Redigér stillingsbetegnelse</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title="Startdato"
            id="from"
            min={undefined}
            max={toDate ? toDate : undefined}
            required={true}
          />
          <!-- FIXME: (don't know which prefix to use) -->
          <!-- Commented out for now, but will probably be needed at some point: -->
          <!-- https://redmine.magenta.dk/issues/58396 -->
          <!-- <DateInput
            bind:value={toDate}
            title="Slutdato"
            id="to"
            startValue={cls.validity.to ? cls.validity.to.split("T")[0] : null}
            min={$fromDate.value ? $fromDate.value : undefined}
            max={undefined}
          /> -->
        </div>
        <!-- <div class="flex flex-row gap-6"> -->
        <Input
          title="Navn"
          id="name"
          bind:value={$name.value}
          startValue={cls.name}
          errors={$name.errors}
          required={true}
        />
        <!-- TODO: user_key removed for now - should probably be a possibility in the future -->
        <!-- <Input
            title="User key"
            id="user-key"
            extra_classes="basis-1/2"
            bind:value={$userKey.value}
            startValue={cls.user_key}
            errors={$userKey.errors}
            required={true}
          /> -->
        <!-- </div> -->
        <input type="hidden" id="facet-uuid" name="facet-uuid" value={cls.facet_uuid} />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Redigér stillingsbetegnelse</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/admin`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
