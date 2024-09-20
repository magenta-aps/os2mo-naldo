<script lang="ts">
  import { step } from "$lib/stores/stepStore"
</script>

<form on:submit|preventDefault={() => step.updateStep("inc")} class="form-step">
  <section class="form-content">
    <h1>Step 1</h1>
    <p class="mb-8 text-msf-cool-gray">Please provide your name.</p>
    <label>
      <div class="flex items-center justify-between">
        <p>Name</p>
      </div>
      <input required type="text" id="name" placeholder="e.g. Stephen King" />
    </label>
    <nav class="form-button-wrapper justify-end">
      <button type="submit" class="btn-next">Next Step</button>
    </nav>
  </section>
</form>
