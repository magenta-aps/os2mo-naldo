<script lang="ts">
  import DateInput from "$lib/components/modals/shared/date_input.svelte"
  import Input from "$lib/components/modals/shared/input.svelte"
  import Select from "$lib/components/modals/shared/select.svelte"
  import { fetchGraph } from "$lib/util/http"

  interface Query {
    data: Data | null
    errors?: Error[]
  }

  interface Data {
    facets: Facet[]
  }

  interface Facet {
    classes: Class[]
  }

  interface Class {
    uuid: null | string
    name: string
  }

  interface Error {
    message: string
  }

  export let startDate: string
  export let endDate: string
  export let addresses: any
  export let detailAmount: number

  let uniqueDate = false
  let addressType: Class | undefined
  let input: string | number
  let visibility: string | undefined

  const fetchFacets = async () => {
    const query = `
    query MyQuery {
      facets(user_keys: ["visibility", "org_unit_address_type"]) {
        classes {
          uuid
          name
        }
      }
    }`

    const res = await fetchGraph(query)
    const json: Query = await res.json()

    if (!json.data) {
      throw new error(json.errors[0].message)
    }

    return json.data.facets
  }

  // Reactivly keeps addresses up to date while being exported to parent components
  $: addresses = JSON.stringify({
    address_type: { uuid: addressType?.uuid },
    visibility: { uuid: visibility },
    validity: {
      // End format YYYY-mm-dd
      from: startDate,
      to: endDate ? endDate : undefined,
    },
    value: input,
    type: "address",
  })
</script>

<div class="divider">Adresse {detailAmount + 1}</div>

<!-- Hack to pass the whole detail object as a string -->
<input name="detail-{detailAmount + 1}" hidden bind:value={addresses} />

{#await fetchFacets()}
  <Select title="Synlighed" id="visibility" disabled={true} />
  <Select title="Adressetype" id="address-type" disabled={true} />
{:then facets}
  <div class="mb-4">
    <Select
      title="Synlighed"
      id="visibility"
      bind:value={visibility}
      iterable={facets[0].classes}
    />
  </div>

  <div class="mb-4">
    <Select
      title="Adressetype"
      id="address-type"
      bind:value={addressType}
      iterable={facets[1].classes}
      returnType="object"
    />
  </div>

  <!-- Handles the initial state where addressType isn't set -->
  {#if addressType}
    {#if addressType.name == "Afdelingskode"}
      <Input
        title="Afdelingskode"
        id="department-code"
        bind:value={input}
        required={true}
      />
    {:else if addressType.name == "Email"}
      <Input title="Email" id="email" bind:value={input} required={true} />
    {/if}
  {/if}

  <div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text">Vælg anden dato</span>
      <input type="checkbox" class="toggle" bind:checked={uniqueDate} />
    </label>
  </div>
  {#if uniqueDate}
    <div class="flex flex-row gap-6 mb-4">
      <div class="form-control">
        <DateInput
          bind:value={startDate}
          title="Start dato"
          id="other-start-date"
          max={endDate
            ? endDate
            : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
      </div>
      <div class="flex-1 justify-end form-control">
        <DateInput
          bind:value={endDate}
          title="Slutdato"
          id="other-end-date"
          min={startDate}
          max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
      </div>
    </div>
  {/if}
{/await}
