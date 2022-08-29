<script lang="ts">
</script>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="create-org-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg pb-4">Opret enhed</h3>

    <p class="pb-4">PLACEHOLDER FOR DATE PICKER</p>
    <div class="pb-4">
      <select class="select select-primary w-full max-w-xs">
        <option disabled selected>Angiv overenhed</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4 </option>
      </select>
    </div>

    <div class="flex flex-row gap-2 pb-4">
      <div>
        <select class="select select-primary w-full max-w-xs">
          <option disabled selected>Tidsregistrering</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4 </option>
        </select>
      </div>

      <div>
        <select class="select select-primary w-full max-w-xs">
          <option disabled selected>Enhedsniveu</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4 </option>
        </select>
      </div>
    </div>

    <div class="flex flex-row gap-2 pb-4">
      <div>
        <select class="select select-primary w-full max-w-xs">
          <option disabled selected>Navn</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4 </option>
        </select>
      </div>

      <div>
        <select class="select select-primary w-full max-w-xs">
          <option disabled selected>Enhedsnummer</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4 </option>
        </select>
      </div>
      <div>
        <select class="select select-primary w-full max-w-xs">
          <option disabled selected>Enhedstype</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4 </option>
        </select>
      </div>
    </div>
    <p class="pb-4">PLACEHOLDER FOR ADRESSER</p>
    <div class="modal-action">
      <label for="create-org-modal" class="btn">Opret</label>
    </div>
  </div>
</div>
