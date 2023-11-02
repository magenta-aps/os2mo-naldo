<script lang="ts">
  export let title: string | undefined = undefined
  export let id: string
  export let value: string
  export let startValue: string | undefined = undefined
  export let extra_classes = ""
  export let groupName: string
</script>

<!--using  checkbox-class to make radioButton and checkbox look visually identical -->
<div class="form-control pb-4">
  <label class="label cursor-pointer p-0 gap-4">
    <input
      type="radio"
      {id}
      name={groupName}
      {value}
      checked={startValue === value}
      class="checkbox checkbox-primary {extra_classes} rounded normal-case font-normal text-base text-base-100 checkbox-radio"
    />
    {#if title}
      <label for={id}>{title}</label>
    {/if}
  </label>
</div>

<style>
  /* Styling removes the minus-sign in the checkbox when the selected value isn't displayed on the screen. */
  .checkbox:indeterminate {
    background-color: transparent !important;
    background-image: none !important;
  }

  .checkbox:indeterminate::before,
  .checkbox:indeterminate::after {
    content: none !important;
  }
</style>
