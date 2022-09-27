<script lang="ts">
  import { DateInput } from "date-picker-svelte"
  import Input from "$lib/components/modals/shared/input.svelte"

  const addressTypes = ["Afdelingskode", "Email"]

  let startDate = new Date()
  let endDate: Date
  let value: string
  let uniqueDate = false

  let input: string | number
  let visibility: string

  export let address = {}
</script>

<label for="visibility" class="pb-1">
  <p>Synlighed</p>
</label>
<select
  id="visibility"
  class="select select-bordered select-sm text-base text-secondary font-normal w-full rounded active:select-primary focus:select-primary active:outline-offset-0 focus:outline-offset-0"
  bind:value={visibility}
  required
>
  <option disabled>Vælg synlighed</option>
  {#each addressTypes as type}
    <option>{type}</option>
  {/each}
</select>
<label for="address-type" class="pb-1">
  <p>Adressetype</p>
</label>
<select
  id="address-type"
  class="select select-bordered select-sm text-base text-secondary font-normal w-full rounded active:select-primary focus:select-primary active:outline-offset-0 focus:outline-offset-0"
  bind:value
  required
>
  <option disabled>Vælg addresse type</option>
  {#each addressTypes as type}
    <option>{type}</option>
  {/each}
</select>

<div class="pt-4">
  {#if value == "Afdelingskode"}
    <Input
      title="Afdelingskode"
      id="department-code"
      bind:value={input}
      required={true}
    />
  {:else if value == "Email"}
    <Input title="Email" id="email" bind:value={input} required={true} />
  {/if}
</div>

<div class="form-control pt-1">
  <label class="label cursor-pointer">
    <span class="label-text">Vælg anden dato</span>
    <input type="checkbox" class="toggle" bind:checked={uniqueDate} />
  </label>
</div>
{#if uniqueDate}
  <div class="flex flex-row gap-6 mb-4">
    <div class="form-control">
      <span name="Start date picker" class="pb-1">
        <p>Startdato</p>
      </span>
      <DateInput
        bind:value={startDate}
        format={"dd-MM-yyyy"}
        placeholder={""}
        min={new Date("1/1/1910")}
        max={endDate ? endDate : new Date(new Date().getFullYear() + 50, 0)}
      />
    </div>
    <div class="flex-1 justify-end form-control">
      <span name="End date picker" class="pb-1">
        <p>Slutdato</p>
      </span>
      <DateInput
        bind:value={endDate}
        format={"dd-MM-yyyy"}
        placeholder={""}
        min={startDate}
        max={new Date(new Date().getFullYear() + 50, 0)}
      />
    </div>
  </div>
{/if}
