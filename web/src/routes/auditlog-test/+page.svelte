<script lang="ts">
  import { onMount } from "svelte"
  import { Timeline } from "vis-timeline/peer"
  import { format, parseISO, subDays, addDays } from "date-fns"
  import type DataItem from "vis-data/peer"
  import { DataSet } from "vis-data/peer"
  import "vis-timeline/styles/vis-timeline-graph2d.min.css"
  import { getAuditlog } from "$lib/util/helpers"
  import Icon from "@iconify/svelte"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"

  let container: HTMLDivElement

  onMount(async () => {
    const data = await getAuditlog("cc0ad4ee-536f-4d78-afc6-e0f99ead6f93")
    // const items = new DataSet(
    //   data.map((reg, i) => ({
    //     id: i,
    //     group: reg.uuid,
    //     content: reg.note,
    //     title: reg.note,
    //     start: format(parseISO(reg.start), "yyyy-MM-dd"),
    //     end: reg.end ? format(parseISO(reg.end), "yyyy-MM-dd") : undefined,
    //   }))
    // )

    // const groups = new DataSet(
    //   data.map((reg, i) => ({
    //     id: reg.uuid + i,
    //     content: reg.actor,
    //   }))
    // )
    // const groups = new DataSet([
    //   { id: "user-1", content: "User 1" },
    //   { id: "user-2", content: "User 2" },
    // ])
    // const items = new DataSet([
    //   {
    //     id: 1,
    //     group: "user-1",
    //     content: "Login",
    //     start: "2024-01-01",
    //     end: "2024-01-01",
    //     title: "User logged in from 192.168.1.10",
    //   },
    //   {
    //     id: 2,
    //     group: "user-1",
    //     content: "Profile update",
    //     start: "2024-01-10",
    //     end: "2024-01-15",
    //   },
    //   {
    //     id: 3,
    //     group: "user-1",
    //     content: "Profile update",
    //     start: "2024-01-01",
    //     end: "2024-01-15",
    //   },
    //   {
    //     id: 4,
    //     group: "user-2",
    //     content: "Audit event",
    //     start: "2024-01-03",
    //     end: "2024-01-07",
    //   },
    // ])
    const groups = new DataSet([
      {
        id: "user-1",
        content: "User 1",
        nestedGroups: ["user-1-name", "user-1-address"],
        showNested: true,
        className: "user-group",
      },
      {
        id: "user-1-name",
        content: "name",
        className: "subgroup",
      },
      {
        id: "user-1-address",
        content: "address",
        className: "subgroup",
      },
      {
        id: "user-2",
        content: "User 2",
        nestedGroups: ["user-2-phone"],
        showNested: true,
        className: "user-group",
      },
      {
        id: "user-2-phone",
        content: "phone",
        className: "subgroup",
      },
    ])

    const items = new DataSet([
      // User 1
      {
        id: 1,
        group: "user-1-name",
        content: "[changed name]",
        start: "2025-08-01",
        end: "2025-08-02",
      },
      {
        id: 2,
        group: "user-1-address",
        content: "[changed address]",
        start: "2025-08-03",
        end: "2025-08-04",
      },
      {
        id: 3,
        group: "user-2-phone",
        content: "[updated phone]",
        start: "2025-08-05",
        end: "2025-08-06",
      },
    ])

    // Convert to array
    const itemsArray = items.get()

    const allDates = itemsArray
      .flatMap((item) => [item.start, item.end ?? item.start])
      .map((d) => parseISO(d))
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
      orientation: "top",
      type: "range",
    }

    new Timeline(container, items, groups, options)
  })
</script>

<div class="px-12 pt-6">
  <div
    class="visualization bg-slate-100 rounded-md shadow-md p-4 overflow-auto"
    bind:this={container}
  />
</div>

<style>
  :global(.vis-item) {
    background-color: #d1e4ff;
    border-radius: 0.25rem;
    border: 0;
    font-size: 0.8rem;
  }

  :global(.vis-item.vis-selected) {
    background-color: #b2d0fc;
    border-radius: 0.25rem;
  }

  /* Remove all default group borders */
  :global(.vis-timeline .vis-group) {
    border: 0;
  }

  /* Add a line ONLY above top-level groups */
  :global(.vis-timeline .vis-group.user-group:first-child) {
    border: 0;
  }
  :global(.vis-timeline .vis-group.user-group:not(:first-child)) {
    border: 0;
    border-top: 1px solid #bfbfbf;
  }

  :global(.vis-group-level-unknown-but-gte1) {
    border: 0;
    text-align: left;
  }
  :global(.vis-ltr .vis-label.vis-nested-group .vis-inner) {
    padding-left: 0.25rem;
    border: 0;
  }

  :global(.vis-labelset:first-child .vis-label:first-child) {
    border: 0;
  }
  :global(.vis-labelset .vis-label) {
    border: 0;
    border-top: 1px solid #bfbfbf;
  }
  :global(.vis-label.vis-nested-group.vis-group-level-unknown-but-gte1) {
    border: 0;
  }

  /* Arrow CSS */
  :global(.vis-label.vis-nesting-group.expanded)::before,
  :global(.vis-label.vis-nesting-group.collapsed)::before {
    content: "";
    display: inline-block;
    width: 1rem;
    height: 1rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12.6 12L8.7 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    transform-origin: center center;
    will-change: transform;
    vertical-align: middle;
  }

  :global(.vis-label.vis-nesting-group.expanded)::before {
    transform: rotate(90deg); /* points down */
  }

  :global(.vis-label.vis-nesting-group.collapsed)::before {
    transform: rotate(0deg); /* points right */
  }
</style>
