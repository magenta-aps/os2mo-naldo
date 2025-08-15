<script lang="ts">
  import { onMount } from "svelte"
  import type { TimelineOptions } from "vis-timeline"
  import { Timeline } from "vis-timeline/peer"
  import { parseISO, subDays, addDays } from "date-fns"
  import { DataSet } from "vis-data/peer"
  import "vis-timeline/styles/vis-timeline-graph2d.min.css"
  import { getAuditlog } from "$lib/http/getAuditlog"
  import type { TimelineItem, TimelineGroup } from "./timeline.ts"
  import "./timeline.css"

  let container: HTMLDivElement
  let timeline: Timeline

  let createTimeline = (
    items: DataSet<TimelineItem>,
    groups: DataSet<TimelineGroup>
  ) => {
    // Convert items to array
    const itemsArray = items.get()

    // Collect all start/end dates
    const allDates = itemsArray
      .flatMap((item) => [item.start, item.end ?? item.start])
      .map((d) => parseISO(d))
      .sort((a, b) => a.getTime() - b.getTime())
    const minDate = allDates[0]
    const maxDate = allDates[allDates.length - 1]

    const paddedStart = subDays(minDate, 7)
    const paddedEnd = addDays(maxDate, 7)

    const options: TimelineOptions = {
      start: paddedStart,
      end: paddedEnd,
      min: subDays(minDate, 90),
      max: addDays(maxDate, 90),
      zoomMin: 1000 * 60 * 60 * 24 * 7, // 1 week
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
      orientation: "top",
      groupHeightMode: "fixed", // Tell vis we want fixed group heights
      type: "range",
      margin: { axis: 4, item: { horizontal: 6, vertical: 2 } },
      showCurrentTime: false,
      tooltip: {
        followMouse: true,
        overflowMethod: "flip",
        delay: 150,
        template: (item) => `
          <div>
            ${item.content ? `<div>${item.content}</div>` : ""}
            ${
              item.start || item.end
                ? `
              <div>
                ${item.start ? `<span>Gyldig fra: ${item.start}</span>` : ""}
                ${item.end ? `<span>Gyldig til: ${item.end}</span>` : ""}
              </div>
            `
                : ""
            }
            <div>LOL 123</div>
          </div>
        `,
      },
    }
    return new Timeline(container, items, groups, options)
  }

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

    const groups: DataSet<TimelineGroup> = new DataSet([
      // User 1
      {
        id: "user-1",
        content: "User 1",
        nestedGroups: ["user-1-name", "user-1-address"],
        showNested: true,
        className: "user-group",
      },
      { id: "user-1-name", content: "name", className: "subgroup" },
      { id: "user-1-address", content: "address", className: "subgroup" },

      // User 2
      {
        id: "user-2",
        content: "User 2",
        nestedGroups: ["user-2-phone"],
        showNested: true,
        className: "user-group",
      },
      { id: "user-2-phone", content: "phone", className: "subgroup" },

      // User 3
      {
        id: "user-3",
        content: "User 3",
        nestedGroups: ["user-3-phone", "user-3-address"],
        showNested: true,
        className: "user-group",
      },
      { id: "user-3-phone", content: "phone", className: "subgroup" },
      { id: "user-3-address", content: "address", className: "subgroup" },

      // User 4
      {
        id: "user-4",
        content: "User 4",
        nestedGroups: ["user-4-email", "user-4-phone"],
        showNested: true,
        className: "user-group",
      },
      { id: "user-4-email", content: "email", className: "subgroup" },
      { id: "user-4-phone", content: "phone", className: "subgroup" },

      // User 5
      {
        id: "user-5",
        content: "User 5",
        nestedGroups: ["user-5-address"],
        showNested: true,
        className: "user-group",
      },
      { id: "user-5-address", content: "address", className: "subgroup" },

      // User 6
      {
        id: "user-6",
        content: "User 6",
        nestedGroups: ["user-6-name", "user-6-phone", "user-6-email"],
        showNested: true,
        className: "user-group",
      },
      { id: "user-6-name", content: "name", className: "subgroup" },
      { id: "user-6-phone", content: "phone", className: "subgroup" },
      { id: "user-6-email", content: "email", className: "subgroup" },
    ])

    const items: DataSet<TimelineItem> = new DataSet([
      // User 1
      {
        id: 1,
        group: "user-1-name",
        content: "[CHANGED NAME]",
        start: "2025-08-01",
        end: "2025-08-15",
      },
      {
        id: 2,
        group: "user-1-address",
        content: "[changed address]",
        start: "2025-08-03",
        end: "2025-08-20",
      },

      // User 2
      {
        id: 3,
        group: "user-2-phone",
        content: "[updated phone]",
        start: "2025-08-05",
        end: "2025-09-05",
      },

      // User 3
      {
        id: 4,
        group: "user-3-phone",
        content: "[updated phone]",
        start: "2025-08-05",
        end: "2025-09-19",
      },
      {
        id: 5,
        group: "user-3-address",
        content: "[changed address]",
        start: "2025-08-05",
        end: "2025-08-25",
      },

      // User 4
      {
        id: 6,
        group: "user-4-email",
        content: "[new email]",
        start: "2025-08-10",
        end: "2025-08-30",
      },
      {
        id: 7,
        group: "user-4-phone",
        content: "[updated phone]",
        start: "2025-08-12",
        end: "2025-09-12",
      },

      // User 5
      {
        id: 8,
        group: "user-5-address",
        content: "[address change]",
        start: "2025-08-15",
        end: "2025-09-10",
      },

      // User 6
      {
        id: 9,
        group: "user-6-name",
        content: "[name update]",
        start: "2025-08-18",
        end: "2025-09-01",
      },
      {
        id: 10,
        group: "user-6-phone",
        content: "[phone update]",
        start: "2025-08-18",
        end: "2025-09-15",
      },
      {
        id: 11,
        group: "user-6-email",
        content: "[email update]",
        start: "2025-08-20",
        end: "2025-09-20",
      },
    ])

    timeline = createTimeline(items, groups)
  })
</script>

<div class="px-12 pt-6">
  <div
    class="visualization bg-slate-100 rounded-md shadow-md p-4 overflow-auto"
    bind:this={container}
  />
</div>
