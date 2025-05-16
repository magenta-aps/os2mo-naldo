<script lang="ts">
  import { onMount } from "svelte"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { base } from "$app/paths"
  import Error from "$lib/components/alerts/Error.svelte"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import SelectMultiple from "$lib/components/forms/shared/SelectMultiple.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Search from "$lib/components/search/Search.svelte"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  import { GetAllPhoneNumbersDocument } from "./query.generated"

  gql`
    query GetAllPhoneNumbers {
  addresses(filter: { address_type: { user_keys: "PhoneEmployee" } }) {
    objects {
      current {
        name
        person {
          uuid
          name
        }
      }
    }
  }
}
  `

  let phones = []
  let query;
  let data;

  onMount(async () => {
    console.log("hulubulu");
    await fetchSomething();
  })


  const fetchSomething = async () => {
    const res = await graphQLClient().request(GetAllPhoneNumbersDocument, {});

    res.addresses.objects.map((el) => { 
      const obj = {
        phone: el.current.name,
        name: el.current.person[0].name,
        uuid: el.current.person[0].uuid,
      };
      phones.push(obj);
    })

    data = []
  }

  $: if (query) {
    data = phones.filter((el) => { return el.phone.includes(query) })
  }
</script>


<div class="flex align-center px-6 pt-6 pb-4">
  <h1>Telefonbogen</h1>
</div>

{#if !data}
  <tr class="leading-5 border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  <div class="pb-1 text-secondary max-w-3xl">
    <label for="bibbob" class="text-sm pb-1"></label>
    <input
      bind:value={query}
      type="text"
      name="bibbob"
      placeholder="Søg på telefonnumre"
      class="input input-bordered input-sm m-4 rounded text-base font-normal w-full focus:outline-0"
    />
  </div>

  <div class="grid grid-cols-4 mx-auto gap-2">
    {#each data as phone, i}
      <div class="card w-96 bg-accent card-md shadow-sm">
        <div class="card-body">
          <a href="{base}/employee/{phone.uuid}"><h2 class="card-title">{phone.name}</h2></a>
          <a href="tel:{phone.phone}">{phone.phone}</a>
        </div>
      </div>
    {/each}
  </div>
{/if}
