<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { base } from "$app/paths"
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { PolicyActorKind } from "$lib/graphql/types"
  import type { PolicyDeclareInput } from "$lib/graphql/types"
  import { PolicyByUuidDocument, SavePolicyDocument } from "./query.generated"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Icon from "@iconify/svelte"
  import deleteOutlineRounded from "@iconify/icons-material-symbols/delete-outline-rounded"

  // When `uuid` is provided we edit that policy (policy_declare upserts on uuid),
  // otherwise we create a new one.
  export let uuid: string | undefined = undefined

  gql`
    query PolicyByUuid($uuids: [UUID!]) {
      policies(filter: { uuids: $uuids }) {
        objects {
          uuid
          name
          description
          start
          end
          actors {
            uuid
            kind
            value
          }
          rules {
            uuid
            type
            field
            condition
          }
        }
      }
    }

    # Save the policy and its full actor + rule sets in a single request, so MO
    # runs it as one transaction (atomic).
    mutation SavePolicy(
      $policy: PolicyDeclareInput!
      $actors: PolicyActorsDeclareInput!
      $rules: PolicyRulesDeclareInput!
    ) {
      policy_declare(input: $policy) {
        uuid
        name
      }
      policy_actors_declare(input: $actors) {
        uuid
      }
      policy_rules_declare(input: $rules) {
        uuid
      }
    }
  `

  // Introspect the schema so the rules step can offer the available mutators
  // and query collections to pick from. Kept out of the `gql` tag so codegen
  // doesn't try to type the introspection query.
  const SCHEMA_QUERY = `
    query PolicyRuleSchema {
      __schema {
        queryType { fields { name } }
        mutationType { fields { name } }
      }
    }
  `
  let mutators: string[] = []
  let collections: string[] = []

  // Steps: policy details -> actors -> rules -> summary.
  const POLICY_STEP = 1
  const ACTORS_STEP = 2
  const RULES_STEP = 3
  const SUMMARY_STEP = 4
  let currentStep = POLICY_STEP

  let name = ""
  let description = ""
  let startDate: string = $date
  let endDate = ""
  let showErrors = false

  // An actor is a kind + value that maps directly to a policy_actor.
  type ActorDraft = {
    kind: PolicyActorKind
    value: string
  }
  // A rule grants access to a GraphQL (type, field). In the UI the "type" is
  // chosen via a Mutator/Query toggle: mutator -> "Mutation", query -> "Query".
  // An optional CEL condition further gates the grant (empty == unconditional).
  type RuleDraft = {
    type: string
    field: string
    condition: string
  }
  let actors: ActorDraft[] = []
  let rules: RuleDraft[] = []

  // Snapshot to restore when "start over" is clicked.
  let initial = {
    name: "",
    description: "",
    start: $date,
    end: "",
    actors: [] as ActorDraft[],
    rules: [] as RuleDraft[],
  }

  // In edit mode we render the form only once the existing data is loaded, so
  // the inputs mount already populated (create mode is ready immediately).
  let loaded = !uuid

  const toDate = (value: unknown): string =>
    value ? String(value).split("T")[0] : ""

  onMount(async () => {
    try {
      const schema: any = await graphQLClient().request(SCHEMA_QUERY)
      mutators = schema.__schema.mutationType.fields
        .map((f: { name: string }) => f.name)
        .sort()
      collections = schema.__schema.queryType.fields
        .map((f: { name: string }) => f.name)
        .sort()

      if (uuid) {
        const res = await graphQLClient().request(PolicyByUuidDocument, {
          uuids: [uuid],
        })
        const policy = res.policies.objects[0]
        if (policy) {
          name = policy.name
          description = policy.description ?? ""
          startDate = toDate(policy.start) || $date
          endDate = toDate(policy.end)
          actors = policy.actors.map((actor) => ({
            kind: actor.kind,
            value: actor.value,
          }))
          rules = policy.rules.map((rule) => ({
            type: rule.type,
            field: rule.field,
            condition: rule.condition ?? "",
          }))
          initial = {
            name,
            description,
            start: startDate,
            end: endDate,
            actors: actors.map((actor) => ({ ...actor })),
            rules: rules.map((rule) => ({ ...rule })),
          }
        }
      }
    } catch (err) {
      $error = { message: err }
    } finally {
      loaded = true
    }
  })

  $: nameErrors = showErrors && !name ? ["required"] : []
  $: startErrors = showErrors && !startDate ? ["required"] : []
  $: stepValid = !!name && !!startDate

  $: kindLabels = {
    [PolicyActorKind.Uuid]: capital($_("uuid")),
    [PolicyActorKind.Username]: capital($_("username")),
    [PolicyActorKind.Role]: capital($_("role", { values: { n: 1 } })),
    [PolicyActorKind.All]: capital($_("everyone")),
    [PolicyActorKind.PersonFilter]: capital($_("person_filter")),
  }

  // An "all" actor needs no value; others require one to be saved.
  const actorIsSet = (actor: ActorDraft): boolean =>
    actor.kind === PolicyActorKind.All || !!actor.value.trim()

  $: steps = [
    {
      step: POLICY_STEP,
      label: capital($_("policies", { values: { n: 1 } })),
      valid: stepValid,
    },
    {
      step: ACTORS_STEP,
      label: capital($_("actors", { values: { n: 2 } })),
      valid: false,
    },
    {
      step: RULES_STEP,
      label: capital($_("rules", { values: { n: 2 } })),
      valid: false,
    },
    { step: SUMMARY_STEP, label: capital($_("summary")), valid: false },
  ]

  const goToStep = (target: number) => {
    // Step 1 is always reachable; the later steps require valid policy details.
    if (target === POLICY_STEP || stepValid) {
      showErrors = true
      currentStep = target
    } else {
      showErrors = true
    }
  }

  const next = () => {
    showErrors = true
    if (stepValid) currentStep = currentStep + 1
  }

  const addActor = () => {
    actors = [...actors, { kind: PolicyActorKind.Username, value: "" }]
  }

  const removeActor = (index: number) => {
    actors = actors.filter((_, i) => i !== index)
  }

  const addRule = () => {
    rules = [...rules, { type: "Query", field: "", condition: "" }]
  }

  const removeRule = (index: number) => {
    rules = rules.filter((_, i) => i !== index)
  }

  const setRuleType = (rule: RuleDraft, type: string) => {
    rule.type = type
    rule.field = ""
    rules = rules
  }

  // Ensure a prefilled value is selectable even if not in the introspected list.
  const optionsFor = (rule: RuleDraft): string[] => {
    const list = rule.type === "Mutation" ? mutators : collections
    return rule.field && !list.includes(rule.field) ? [rule.field, ...list] : list
  }

  const startOver = () => {
    name = initial.name
    description = initial.description
    startDate = initial.start
    endDate = initial.end
    actors = initial.actors.map((actor) => ({ ...actor }))
    rules = initial.rules.map((rule) => ({ ...rule }))
    showErrors = false
    currentStep = POLICY_STEP
  }

  const submit = async () => {
    // Generate the UUID client-side so the policy, its actors and its rules can
    // be saved in a single (atomic) request; reuse the existing UUID on edit.
    const policyUuid = uuid ?? crypto.randomUUID()
    const policy: PolicyDeclareInput = {
      uuid: policyUuid,
      name,
      start: startDate,
      ...(description && { description }),
      ...(endDate && { end: endDate }),
    }
    const declaredActors = actors
      .filter(actorIsSet)
      .map((actor) => ({
        kind: actor.kind,
        value: actor.kind === PolicyActorKind.All ? "" : actor.value.trim(),
      }))
    const declaredRules = rules
      .filter((rule) => rule.field.trim())
      .map((rule) => ({
        type: rule.type,
        field: rule.field.trim(),
        // The condition passes through verbatim; an empty one is treated as
        // unconditional by MO.
        ...(rule.condition.trim() && { condition: rule.condition.trim() }),
      }))
    try {
      const result = await graphQLClient().request(SavePolicyDocument, {
        policy,
        actors: { policy: policyUuid, actors: declaredActors },
        rules: { policy: policyUuid, rules: declaredRules },
      })
      $success = {
        message: capital(
          $_(uuid ? "success_edit_item" : "success_create_item", {
            values: {
              item: $_("policies", { values: { n: 0 } }),
              name: result.policy_declare.name,
            },
          })
        ),
      }
      goto(`${base}/admin/policies`)
    } catch (err) {
      $error = { message: err }
    }
  }
</script>

<div class="mx-6">
  <div
    class="whitespace-wrap block xl:tabs tabs-border xxl:whitespace-nowrap w-full flex"
  >
    {#each steps as s}
      <button
        class="tab flex-1 text-center text-base hover:no-underline
          {s.step === currentStep ? 'tab-active text-primary' : 'text-base-content'}"
        on:click={() => goToStep(s.step)}
      >
        {`${s.step}. ${s.label}`}
        {s.valid ? "✓" : ""}
      </button>
    {/each}
  </div>

  <div class="mt-8">
    {#if !loaded}
      <p class="text-sm text-base-content">{capital($_("loading"))}</p>
    {:else if currentStep === POLICY_STEP}
      <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
        <div class="p-8">
          <Input
            title={capital($_("name"))}
            id="name"
            bind:value={name}
            errors={nameErrors}
            required={true}
          />
          <TextArea
            title={capital($_("description"))}
            id="description"
            bind:value={description}
          />
          <div class="flex flex-row gap-6">
            <DateInput
              bind:value={startDate}
              errors={startErrors}
              title={capital($_("date.start_date"))}
              id="start"
              max={endDate ? endDate : null}
              required={true}
            />
            <DateInput
              bind:value={endDate}
              title={capital($_("date.end_date"))}
              id="end"
              min={startDate ? startDate : null}
            />
          </div>
        </div>
      </div>
      <div class="flex py-6 gap-4">
        <Button type="button" title={capital($_("next"))} on:click={next} />
        <Button
          type="button"
          title={capital($_("cancel"))}
          outline={true}
          href="{base}/admin/policies"
        />
      </div>
    {:else if currentStep === ACTORS_STEP}
      <div class="sm:w-full md:w-3/4 xl:w-1/2 space-y-4">
        {#if actors.length === 0}
          <p class="text-sm text-base-content/70">
            {$_("policy_unbound_hint")}
          </p>
        {/if}

        {#each actors as actor, i}
          <div class="bg-base-200 rounded-sm">
            <div class="p-6">
              <div class="flex flex-row gap-6 items-end">
                <div class="form-control pb-3 basis-1/3">
                  <label for="actor-kind-{i}" class="text-sm pb-1">
                    {capital($_("actors", { values: { n: 1 } }))}
                  </label>
                  <select
                    id="actor-kind-{i}"
                    bind:value={actor.kind}
                    class="select select-bordered select-sm rounded text-base font-normal w-full focus:outline-0 focus:select-primary"
                  >
                    <option value={PolicyActorKind.Username}
                      >{capital($_("username"))}</option
                    >
                    <option value={PolicyActorKind.Role}
                      >{capital($_("role", { values: { n: 1 } }))}</option
                    >
                    <option value={PolicyActorKind.Uuid}
                      >{capital($_("uuid"))}</option
                    >
                    <option value={PolicyActorKind.All}
                      >{capital($_("everyone"))}</option
                    >
                    <option value={PolicyActorKind.PersonFilter}
                      >{capital($_("person_filter"))}</option
                    >
                  </select>
                </div>
                {#if actor.kind !== PolicyActorKind.All}
                  <Input
                    title={capital($_("value"))}
                    id="actor-value-{i}"
                    bind:value={actor.value}
                    placeholder={actor.kind === PolicyActorKind.PersonFilter
                      ? $_("person_filter_hint")
                      : undefined}
                    extra_classes="basis-2/3"
                  />
                {:else}
                  <div class="basis-2/3" />
                {/if}
                <button
                  type="button"
                  class="text-base-content pb-5"
                  title={capital($_("remove"))}
                  on:click={() => removeActor(i)}
                >
                  <Icon icon={deleteOutlineRounded} width="25" height="25" />
                </button>
              </div>
            </div>
          </div>
        {/each}

        <Button
          type="button"
          outline={true}
          title={capital(
            $_("create_item", { values: { item: $_("actors", { values: { n: 1 } }) } })
          )}
          on:click={addActor}
        />
      </div>
      <div class="flex py-6 gap-4">
        <Button
          type="button"
          title={capital($_("back"))}
          outline={true}
          on:click={() => (currentStep = POLICY_STEP)}
        />
        <Button
          type="button"
          title={capital($_("next"))}
          on:click={() => (currentStep = RULES_STEP)}
        />
      </div>
    {:else if currentStep === RULES_STEP}
      <div class="sm:w-full md:w-3/4 xl:w-1/2 space-y-4">
        {#if rules.length === 0}
          <p class="text-sm text-base-content/70">
            {$_("policy_no_rules_hint")}
          </p>
        {/if}

        {#each rules as rule, i}
          <div class="bg-base-200 rounded-sm">
            <div class="p-6 space-y-4">
              <div class="flex justify-between items-center">
                <div class="join">
                  <button
                    type="button"
                    class="btn btn-sm join-item {rule.type === 'Mutation'
                      ? 'btn-primary'
                      : 'btn-outline'}"
                    on:click={() => setRuleType(rule, "Mutation")}
                  >
                    {capital($_("mutator"))}
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm join-item {rule.type !== 'Mutation'
                      ? 'btn-primary'
                      : 'btn-outline'}"
                    on:click={() => setRuleType(rule, "Query")}
                  >
                    {capital($_("query"))}
                  </button>
                </div>
                <button
                  type="button"
                  class="text-base-content"
                  title={capital($_("remove"))}
                  on:click={() => removeRule(i)}
                >
                  <Icon icon={deleteOutlineRounded} width="25" height="25" />
                </button>
              </div>

              <div class="form-control pb-1">
                <label for="rule-field-{i}" class="text-sm pb-1">
                  {rule.type === "Mutation"
                    ? capital($_("mutator"))
                    : capital($_("policies", { values: { n: 2 } }))}
                </label>
                <select
                  id="rule-field-{i}"
                  bind:value={rule.field}
                  class="select select-bordered select-sm rounded text-base font-normal w-full focus:outline-0 focus:select-primary"
                >
                  <option value="" disabled
                    >{capital($_("select_item", { values: { item: $_("field") } }))}</option
                  >
                  {#each optionsFor(rule) as option}
                    <option value={option}>{option}</option>
                  {/each}
                </select>
              </div>

              <!-- Optional CEL condition that further gates the grant. For now
                   this is a free-form text field passed verbatim to MO.
                   TODO: offer a simple dropdown-based CEL builder as an
                   alternative input mode (e.g. pick token attribute / operator
                   / value rows that compile to CEL), keeping this raw field as
                   the "advanced" escape hatch. -->
              <div class="form-control pb-1">
                <label for="rule-condition-{i}" class="text-sm pb-1">
                  {capital($_("condition"))}
                  <span class="text-base-content/70">({$_("optional")})</span>
                </label>
                <input
                  id="rule-condition-{i}"
                  type="text"
                  bind:value={rule.condition}
                  placeholder={'"admin" in token.roles'}
                  class="input input-bordered input-sm rounded font-mono text-sm w-full focus:outline-0 focus:input-primary"
                />
                <span class="text-xs text-base-content/70 pt-1">
                  {$_("policy_condition_hint")}
                </span>
              </div>
            </div>
          </div>
        {/each}

        <Button
          type="button"
          outline={true}
          title={capital(
            $_("create_item", { values: { item: $_("rules", { values: { n: 1 } }) } })
          )}
          on:click={addRule}
        />
      </div>
      <div class="flex py-6 gap-4">
        <Button
          type="button"
          title={capital($_("back"))}
          outline={true}
          on:click={() => (currentStep = ACTORS_STEP)}
        />
        <Button
          type="button"
          title={capital($_("next"))}
          on:click={() => (currentStep = SUMMARY_STEP)}
        />
      </div>
    {:else}
      <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
        <div class="p-8 space-y-5">
          <div>
            <h3 class="pb-2 text-primary">
              {capital($_("policies", { values: { n: 1 } }))}
            </h3>
            <dl class="grid gap-1">
              <div class="grid grid-cols-2">
                <dt>{capital($_("name"))}:</dt>
                <dd>{name}</dd>
              </div>
              <div class="grid grid-cols-2">
                <dt>{capital($_("description"))}:</dt>
                <dd>{description}</dd>
              </div>
              <div class="grid grid-cols-2">
                <dt>{capital($_("date.start_date"))}:</dt>
                <dd>{startDate}</dd>
              </div>
              <div class="grid grid-cols-2">
                <dt>{capital($_("date.end_date"))}:</dt>
                <dd>{endDate}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 class="pb-2 text-primary">
              {capital($_("actors", { values: { n: 2 } }))}
            </h3>
            {#if actors.filter(actorIsSet).length === 0}
              <p class="text-sm text-base-content/70">
                {$_("policy_unbound_hint")}
              </p>
            {:else}
              <ul class="list-disc list-inside">
                {#each actors.filter(actorIsSet) as actor}
                  <li>
                    {actor.kind === PolicyActorKind.All
                      ? kindLabels[actor.kind]
                      : `${kindLabels[actor.kind]}: ${actor.value}`}
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
          <div>
            <h3 class="pb-2 text-primary">
              {capital($_("rules", { values: { n: 2 } }))}
            </h3>
            {#if rules.filter((r) => r.field.trim()).length === 0}
              <p class="text-sm text-base-content/70">
                {$_("policy_no_rules_hint")}
              </p>
            {:else}
              <ul class="list-disc list-inside">
                {#each rules.filter((r) => r.field.trim()) as rule}
                  <li>
                    {rule.type}.{rule.field}
                    {#if rule.condition.trim()}
                      <span class="font-mono text-sm text-base-content/70">
                        ({rule.condition.trim()})
                      </span>
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>
      </div>
      <div class="sm:w-full md:w-3/4 xl:w-1/2 flex justify-between py-6 gap-4">
        <div class="flex gap-4">
          <Button
            type="button"
            title={capital($_("back"))}
            outline={true}
            on:click={() => (currentStep = RULES_STEP)}
          />
          <Button type="button" title={capital($_("submit"))} on:click={submit} />
        </div>
        <Button
          type="button"
          title={capital($_("start_over"))}
          outline={true}
          on:click={startOver}
        />
      </div>
    {/if}
  </div>
</div>

<Error />
