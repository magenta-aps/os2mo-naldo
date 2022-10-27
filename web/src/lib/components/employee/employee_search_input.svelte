<script lang="ts">
  import Icon from "$lib/components/icon.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"

  export let input: string
  export let cardView: boolean

  let chosenOrg: object
  let leaderType: object
</script>

<div class="bg-slate-100 rounded border border-slate-300 shadow-sm">
  <div class="grid grid-cols-4 gap-4 m-5">
    <Input id="input" size="sm" bind:value={input} placeholder="Søg" />
    <Select
      id="org-unit"
      returnType="object"
      bind:value={chosenOrg}
      startValue="Enhed"
      iterable={[{ name: "TODO", value: "TODO" }]}
    />
    <Select
      id="leader-type"
      returnType="object"
      bind:value={leaderType}
      startValue="Ledertype"
      iterable={[{ name: "TODO", value: "TODO" }]}
    />
    <button
      class="btn btn-sm btn-outline bg-base-100 rounded normal-case font-normal border-slate-300 text-secondary text-base ml-auto hover:btn-primary"
      >Nulstil</button
    >
  </div>
</div>

<div class="flex justify-end gap-4">
  <label>
    <input
      type="radio"
      class="radio w-0 h-0 opacity-0"
      value={false}
      bind:group={cardView}
    />
    <div
      class="{!cardView
        ? 'bg-accent text-secondary'
        : 'text-slate-600'} cursor-pointer rounded border border-slate-300 p-2"
    >
      <Icon type="bars" />
    </div>
  </label>
  <label>
    <input
      type="radio"
      class="radio w-0 h-0 opacity-0"
      value={true}
      bind:group={cardView}
    />
    <div
      class="{cardView
        ? 'bg-accent text-secondary'
        : 'text-slate-600'} cursor-pointer rounded border border-slate-300 p-2"
    >
      <Icon type="grid" />
    </div>
  </label>
</div>
