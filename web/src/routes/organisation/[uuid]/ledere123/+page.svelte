<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"

  let startDate = new Date().toISOString().split("T")[0]
  let endDate: string
  let detailAmount: number
</script>

<form style="width: 556px;">
 
  <div class="mx-6">

    <!-- Skriv fed kode her -->



      <div class="flex justify-between">
      <Select 
      title="Ledertype"
      id="org-type"
      required={true}
    />
    <Select
      title="Lederniveau"
      id="org-type"
      required={true}
    />
    </div>
    <Select
      title="Angiv medarbejder (Valgfri)"
      id="org-type"
      required={true}
    />

    <div class="flex flex-row gap-6 mb-6">
        <div class="basis-1/2">
          <Select
            title="slutdato"
            id="org-level"
            required={true}
          />
        </div>
        <div class="basis-1/2">
            <Select
             title="startdato" id="unit-number" />
        </div>
        
      </div>


      <div class="flex justify-between">
        <div>
          <button
            on:click={() => {
              detailAmount++
            }}
            class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
            type="button">+ Tilføj adresser</button
          >
        </div>
        <div>
          <button
            type="button"
            class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
          >
            Annullér
          </button>
          <button
            type="submit"
            class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
            >Opret enhed</button
          >
        </div>
      </div>
</div>
</form>
