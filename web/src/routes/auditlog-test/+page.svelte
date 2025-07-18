<script lang="ts">
  import { onMount } from "svelte"
  import { Timeline } from "vis-timeline/peer"
  import { parseISO, subDays, addDays } from "date-fns"
  import type { DataItem } from "vis-data/peer"
  import { DataSet } from "vis-data/peer"
  import "vis-timeline/styles/vis-timeline-graph2d.min.css"

  let container: HTMLDivElement

  onMount(() => {
    const groups = new DataSet([
      { id: "user-1", content: "User 1" },
      { id: "user-2", content: "User 2" },
    ])
    const items = new DataSet([
      {
        id: 1,
        group: "user-1",
        content: "Login",
        start: "2024-01-01",
        end: "2024-01-05",
        title: "User logged in from 192.168.1.10",
      },
      {
        id: 2,
        group: "user-1",
        content: "Profile update",
        start: "2024-01-10",
        end: "2024-01-15",
      },
      {
        id: 3,
        group: "user-2",
        content: "Audit event",
        start: "2024-01-03",
        end: "2024-01-07",
      },
    ])

    // Convert to array
    const itemsArray = items.get()

    const allDates = itemsArray
      .flatMap((item) => [item.start, item.end ?? item.start])
      .map((d) => parseISO(String(d)))
      .sort((a, b) => a.getTime() - b.getTime())

    const minDate = allDates[0]
    const maxDate = allDates[allDates.length - 1]

    const paddedStart = subDays(minDate, 7) // start of viewport
    const paddedEnd = addDays(maxDate, 7) // end of viewport

    const options = {
      start: paddedStart,
      end: paddedEnd,
      min: subDays(minDate, 90), // how far back user can scroll/zoom
      max: addDays(maxDate, 90), // how far forward user can go
      zoomMin: 1000 * 60 * 60 * 24 * 7, // min zoom: 1 week
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 10, // max zoom: 10 years
    }

    new Timeline(container, items, groups, options)
  })
</script>

<div
  class="visualization bg-slate-100 rounded-md shadow-md p-4 overflow-auto"
  bind:this={container}
/>

<style>
  :global(.vis-item) {
    background-color: #d1e4ff;
    border-radius: 0.25rem;
    border: 0;
  }

  :global(.vis-item.vis-selected) {
    background-color: #b2d0fc;
    border-radius: 0.25rem;
  }
</style>
