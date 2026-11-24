<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { createEventDispatcher, onDestroy } from "svelte"
  import { celSyntaxError } from "$lib/utils/cel"

  // Every condition in the policy editor goes through here, so a guided
  // editor for simple rules can be added beside the raw expression without
  // touching its callers.
  export let id: string
  export let value: string
  export let disabled = false
  export let invalid = false
  // MO's explanation of why the condition does not parse
  export let error: string | undefined = undefined
  // Set when a save was refused over this condition, to show why at once
  export let flagged = false

  const dispatch = createEventDispatcher<{ change: string }>()

  // A typo shows once typing pauses, not at every half-typed keystroke, and
  // goes as soon as the condition parses again
  let settled = value
  let timer: ReturnType<typeof setTimeout> | undefined
  const settle = (condition: string, delay: number) => {
    clearTimeout(timer)
    timer = setTimeout(() => (settled = condition), delay)
  }
  onDestroy(() => clearTimeout(timer))

  $: mistake = celSyntaxError(value)
  $: syntaxError = mistake && (flagged || celSyntaxError(settled)) ? mistake : undefined
</script>

<div class="form-control">
  <div class="pb-1 text-base-content">
    <label for={id} class="text-sm pb-1">
      {capital($_("policy_condition"))}
    </label>
    <textarea
      {id}
      {value}
      on:input={(e) => {
        dispatch("change", e.currentTarget.value)
        settle(e.currentTarget.value, 500)
      }}
      on:blur={(e) => settle(e.currentTarget.value, 0)}
      {disabled}
      rows={Math.min(Math.max(value.split("\n").length, 2), 12)}
      spellcheck="false"
      autocomplete="off"
      autocapitalize="off"
      placeholder="true"
      class="textarea textarea-bordered max-h-96 textarea-sm rounded text-base font-normal font-mono w-full focus:outline-0
        {invalid || error || syntaxError ? 'textarea-error' : 'focus:textarea-primary'}"
    />
  </div>
  {#if invalid}
    <span class="text-xs text-error">
      {$_("validation.is_required", { values: { field: $_("policy_condition") } })}
    </span>
  {/if}
  {#if error}
    <pre class="text-xs text-error font-mono whitespace-pre-wrap">{error}</pre>
  {:else if syntaxError}
    <pre
      class="text-xs text-error font-mono whitespace-pre-wrap"
      data-cel-syntax>{syntaxError}</pre>
  {/if}
</div>
