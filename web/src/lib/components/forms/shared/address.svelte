<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
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
  export let extra_classes = ""
  
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

    if (json.data) {
      return json.data.facets
    } else if (json.errors) {
      throw new Error(json.errors[0].message)
    } else {
      throw new Error(`Unknown error: ${JSON.stringify(json)}`)
    }
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

<div class="divider px-8 pt-6 b-4 w-full text-sm">Adresse {detailAmount + 1}</div>

<!-- Hack to pass the whole detail object as a string -->
<input name="detail-{detailAmount + 1}" hidden bind:value={addresses} />

<div class="p-8 {extra_classes}">
  {#await fetchFacets()}
    <div class="flex flex-row gap-6">
      <DateInput title="Startdato" id="start-date" bind:value={startDate} disabled={true} />
      <DateInput title="Slutdato" id="end-date" bind:value={endDate} disabled={true} />
    </div>
    <Select title="Synlighed" id="visibility" disabled={true} />
    <Select title="Adressetype" id="address-type" disabled={true} />
  {:then facets}

    <div class="flex flex-row gap-6">
      <DateInput
        bind:value={startDate}
        title="Startdato"
        id="start-date"
        max={endDate
          ? endDate
          : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      />

      <DateInput
        bind:value={endDate}
        title="Slutdato"
        id="end-date"
        min={startDate}
        max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      />
    </div>
    <Select
      title="Synlighed"
      id="visibility"
      bind:value={visibility}
      iterable={facets[0].classes}
    />
    <Select
      title="Adressetype"
      id="address-type"
      bind:value={addressType}
      iterable={facets[1].classes}
      returnType="object"
    />

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
        <Input title="Email" id="email" type="email" bind:value={input} required={true} />
      {:else if addressType.name == "P-nummer"}
        <Input title="P-nummer" id="email" bind:value={input} required={true} />
      {:else if addressType.name == "Postadresse"}
        <Input title="Postadresse" id="postadress" bind:value={input} required={true} />
      {:else if addressType.name == "Webadresse"}
        <Input
          title="Weabdresse"
          id="webadress"
          type="url"
          pattern="^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$"
          patternMessage="Indtast en gyldig url"
          bind:value={input}
          required={true}
        />
      {:else if addressType.name == "Formålskode"}
        <Input title="Formålskode" id="purpose" bind:value={input} required={true} />
      {:else if addressType.name == "Lokation"}
        <Input title="Lokation" id="lokation" bind:value={input} required={true} />
      {:else if addressType.name == "EAN-nummer"}
        <Input title="EAN-nummer" id="ean" bind:value={input} required={true} />
      {:else if addressType.name == "Skolekode"}
        <Input title="Skolekode" id="skolekode" bind:value={input} required={true} />
      {:else if addressType.name == "Fax"}
        <Input title="Fax" id="fax" bind:value={input} required={true} />
      {:else if addressType.name == "Returadresse"}
        <Input
          title="Returadresse"
          id="returnadress"
          bind:value={input}
          required={true}
        />
      {:else if addressType.name == "Henvendelsessted"}
        <Input title="Henvendelsessted" id="inquiry" bind:value={input} required={true} />
      {:else if addressType.name == "Telefon"}
        <Input
          title="Telefon"
          id="phone"
          type="tel"
          pattern="[0-9]+"
          patternMessage="Kun tal & '+' er tilladt"
          bind:value={input}
          required={true}
        />
      {/if}
    {/if}
    <div class="form-control">
      <label class="flex justify-between cursor-pointer">
        <span class="text-sm text-secondary">Vælg anden dato</span>
        <input type="checkbox" class="toggle" bind:checked={uniqueDate} />
      </label>
    </div>
    {#if uniqueDate}
      <div class="flex flex-row gap-6">
        <DateInput
          bind:value={startDate}
          title="Start dato"
          id="other-start-date"
          max={endDate
            ? endDate
            : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
        <DateInput
          bind:value={endDate}
          title="Slutdato"
          id="other-end-date"
          min={startDate}
          max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
      </div>
    {/if}
  {/await}
</div>
