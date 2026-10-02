<script lang="ts">
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import { firstValidDay, lastValidDay, moValidityFrom, toMO } from "$lib/utils/date"
  import { Temporal } from "temporal-polyfill"

  export let title: string | undefined = undefined
  export let id: string
  // MO's validity.from: midnight at the start of the first valid day.
  export let value: Temporal.ZonedDateTime | null | undefined = undefined
  export let validationValue: Temporal.ZonedDateTime | null | undefined = undefined
  export let startValue: Temporal.ZonedDateTime | null | undefined = undefined
  // Validity bounds: `min` is a validity.from, `max` a validity.to.
  export let min: Temporal.ZonedDateTime | null | undefined = undefined
  export let max: Temporal.ZonedDateTime | null | undefined = undefined
  export let required = false
  export let disabled = false
  export let errors: string[] = []

  // null and undefined pass through, like DateInput's.
  let day: Temporal.PlainDate | null | undefined =
    firstValidDay(startValue ?? value) ?? undefined
  $: value = day ? moValidityFrom(day) : day
  $: validationValue = value
</script>

<DateInput
  bind:value={day}
  {title}
  {id}
  name=""
  min={firstValidDay(min)}
  max={lastValidDay(max)}
  {required}
  {disabled}
  {errors}
/>
<input type="hidden" name={id} value={value ? toMO(value) : ""} />
