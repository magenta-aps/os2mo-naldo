<script lang="ts">
  import { DateInput } from "date-picker-svelte"

  let startDate = new Date()
  let endDate: Date
  let name: string
  let parentOrgUnit: String
</script>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="create-org-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box w-4/5 max-w-2xl">
    <label for="create-org-modal" class="btn btn-sm btn-circle absolute right-4 top-4"
      >✕</label
    >
    <h3 class="font-bold text-lg pb-4">Opret enhed</h3>

    <form>
      <div class="flex sm:flex-row flex-col gap-2 pb-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Startdato</span>
          </label>
          <DateInput
            bind:value={startDate}
            format={"dd-MM-yyyy"}
            placeholder={"Startdato"}
            min={new Date("1/1/1910")}
            max={endDate ? endDate : new Date(new Date().getFullYear() + 50, 0)}
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Slutdato</span>
          </label>
          <DateInput
            bind:value={endDate}
            format={"dd-MM-yyyy"}
            placeholder={"Slutdato"}
            min={startDate}
            max={new Date(new Date().getFullYear() + 50, 0)}
          />
        </div>
      </div>
      <div class="form-control pb-4 w-full max-w-xl">
        <label class="label">
          <span class="label-text">Angiv overenhed</span>
        </label>
        <select class="select select-bordered">
          <option disabled selected>Angiv overenhed</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4 </option>
        </select>
      </div>

      <div class="form-control pb-4 w-full max-w-xl">
        <label class="label">
          <span class="label-text">Enhedsniveu</span>
        </label>
        <select class="select select-bordered">
          <option disabled selected>Enhedsniveu</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4 </option>
        </select>
      </div>

      <div class="flex md:flex-row flex-col gap-2 pb-4 w-full max-w-xl">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Navn</span>
          </label>
          <input
            bind:value={name}
            type="text"
            placeholder="Navn"
            class="input input-bordered"
          />
        </div>

        <div class="flex flex-row gap-2">
          <div>
            <label class="label">
              <span class="label-text">Enhedsnummer</span>
            </label>
            <select class="select select-bordered">
              <option disabled selected>Enhedsnummer</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4 </option>
            </select>
          </div>
          <div>
            <label class="label">
              <span class="label-text">Enhedstype</span>
            </label>
            <select class="select select-bordered">
              <option disabled selected>Enhedstype</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4 </option>
            </select>
          </div>
        </div>
      </div>
      <p class="pb-4">PLACEHOLDER FOR ADRESSER</p>
      <div class="modal-action">
        <label for="create-org-modal" class="btn">Opret</label>
      </div>
    </form>
  </div>
</div>

<style>
  :root {
    --date-picker-background: hsl(var(--b1));
    --date-picker-foreground: hsl(var(--bc));
    --date-picker-highlight-border: hsl(var(--p));
    --date-picker-highlight-shadow: hsl(var(--p));
  }
</style>
