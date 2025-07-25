<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { CreateEngagementDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { SubmitFunction } from "./$types"
  import type { FacetValidities } from "$lib/util/getClasses"
  import { getClassesByFacetUserKey } from "$lib/util/getClasses"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { getClasses, getValidities } from "$lib/util/helpers"
  import { env } from "$env/dynamic/public"
  import { onMount } from "svelte"

  gql`
    mutation CreateEngagement($input: EngagementCreateInput!, $date: DateTime!) {
      engagement_create(input: $input) {
        current(at: $date) {
          person {
            name
          }
        }
      }
    }
  `

  let startDate: string = $date
  let toDate: string
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  onMount(async () => {
    validities = $page.params.uuid
      ? await getValidities($page.params.uuid)
      : { from: null, to: null }
  })

  const fromDate = field("from", "", [required()])
  const employee = field("employee", "", [required()])
  const jobFunction = field("job_function", "", [required()])
  const engagementType = field("engagement_type", "", [required()])
  const svelteForm = form(fromDate, employee, jobFunction, engagementType)

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if (!$svelteForm.valid) return
      if (result.type !== "success" || !result.data) return
      try {
        const mutation = await graphQLClient().request(CreateEngagementDocument, {
          input: result.data,
          date: result.data.validity.from,
        })
        $success = {
          message: capital(
            $_("success_create_item", {
              values: {
                item: $_("engagement", { values: { n: 0 } }),
                name: mutation.engagement_create.current?.person?.[0].name,
              },
            })
          ),
          uuid: $page.params.uuid,
          type: "organisation",
        }
      } catch (err) {
        $error = { message: err }
      }
    }

  let facets: FacetValidities[]
  let abortController: AbortController
  $: if (startDate) {
    // Abort the previous request if a new one is about to start
    if (abortController) abortController.abort()
    abortController = new AbortController()

    const params = {
      currentDate: startDate,
      orgUuid: $page.params.uuid,
      facetUserKeys: ["engagement_type", "engagement_job_function", "primary_type"],
    }

    ;(async () => {
      try {
        facets = await getClasses(params, abortController.signal)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err)
        }
      }
    })()
  }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("engagement", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("engagement", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <DateInput
          bind:value={startDate}
          bind:validationValue={$fromDate.value}
          errors={$fromDate.errors}
          title={capital($_("date.start_date"))}
          id="from"
          min={validities.from}
          max={toDate ? toDate : validities.to}
          required={true}
        />
        <DateInput
          bind:value={toDate}
          title={capital($_("date.end_date"))}
          id="to"
          min={$fromDate.value ? $fromDate.value : validities.from}
          max={validities.to}
        />
      </div>
      <Search
        type="employee"
        bind:name={$employee.value}
        errors={$employee.errors}
        on:clear={() => ($employee.value = "")}
        required={true}
      />
      {#if facets}
        <div class="flex flex-row gap-6">
          <Input title="ID" id="user-key" extra_classes="basis-1/2" />
          <Select
            title={env.PUBLIC_SHOW_EXTENSION_1 === "true"
              ? capital($_("job_code"))
              : capital($_("job_function", { values: { n: 1 } }))}
            id="job-function"
            bind:name={$jobFunction.value}
            errors={$jobFunction.errors}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
            required={true}
            extra_classes="basis-1/2"
          />
        </div>
        {#if env.PUBLIC_SHOW_EXTENSION_1 === "true" || env.PUBLIC_SHOW_EXTENSION_2 === "true"}
          <div class="flex flex-row gap-6">
            {#if env.PUBLIC_SHOW_EXTENSION_1 === "true"}
              <Input
                title={capital($_("job_function", { values: { n: 1 } }))}
                id="extension-1"
                extra_classes="basis-1/2"
              />
            {/if}
            {#if env.PUBLIC_SHOW_EXTENSION_2 === "true"}
              <Input
                title={capital($_("department_code"))}
                id="extension-2"
                extra_classes="basis-1/2"
              />
            {/if}
          </div>
        {/if}
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("engagement_type"))}
            id="engagement-type"
            bind:name={$engagementType.value}
            errors={$engagementType.errors}
            iterable={getClassesByFacetUserKey(facets, "engagement_type")}
            required={true}
            extra_classes="basis-1/2"
          />
          <Select
            title={capital($_("primary"))}
            id="primary"
            iterable={getClassesByFacetUserKey(facets, "primary_type")}
            extra_classes="basis-1/2"
            isClearable={true}
          />
        </div>
      {/if}
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("engagement", { values: { n: 1 } }) },
        })
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      href="{base}/organisation/{$page.params.uuid}"
    />
  </div>
  <Error />
</form>
