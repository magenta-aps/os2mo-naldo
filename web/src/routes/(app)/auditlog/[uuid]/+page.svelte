<script lang="ts">
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { Timeline } from "vis-timeline/peer"
  import { DataSet } from "vis-data/peer"
  import "vis-timeline/styles/vis-timeline-graph2d.min.css"
  import { format, subYears, addYears, min, max } from "date-fns"
  import { getAuditlog } from "$lib/http/getAuditlog"
  import {
    transformAuditLog,
    type Registration,
    type TimelineItem,
    type TimelineGroup,
  } from "./timeline"
  import "./timeline.css"

  let container: HTMLDivElement
  let timeline: Timeline
  let isLoading = true

  // ==========================================
  // RENDERER: MAP DATA TO VISUALS
  // ==========================================
  /**
   * Converts our clean "Registration" objects into the specific format
   * required by the vis-timeline library (Groups and Items).
   */
  const renderTimeline = (cleanData: Registration[]) => {
    // 1. Initialize Vis.js Datasets
    // These are special observable arrays that Vis.js uses to re-render efficiently
    const groups = new DataSet<TimelineGroup>()
    const items = new DataSet<TimelineItem>()

    // 2. Define Default Viewport
    // We default to showing the last 2 years and the next 1 year.
    // This ensures the timeline looks good even if empty.
    const now = new Date()
    const defaultZoomStart = subYears(now, 2)
    const defaultZoomEnd = addYears(now, 1)

    // We will expand these boundaries if we find data outside this range.
    let minDate = defaultZoomStart
    let maxDate = defaultZoomEnd

    // 3. Iterate over the Clean Data
    cleanData.forEach((reg) => {
      // --- A. Create the Main Header Group (The Actor) ---
      // This is the parent row that contains the user's name and registration date.
      const regDateStr = reg.registeredAt
        ? format(reg.registeredAt, "dd-MM-yyyy HH:mm")
        : "?"

      groups.add({
        id: reg.id,
        content: `${reg.actor} (${regDateStr})`,
        nestedGroups: [], // We will push children IDs here later
        showNested: true, // Collapsible
        className: "user-group", // See timeline.css
      })

      // --- B. Create Sub-Rows (The Attributes) ---
      Object.entries(reg.timelines).forEach(([key, entries]) => {
        const rowId = `${reg.id}-${key}` // Unique ID: "reg-0-address"

        // Translate the key (e.g., "org_unit" -> "Organisationsenhed")
        // We force {n:1} to ensure we get the singular form from the dictionary
        const translatedKey = capital($_(key, { values: { n: 1 } }))

        // Add the Sub-Group
        groups.add({
          id: rowId,
          content: translatedKey,
          className: "subgroup",
        })

        // Link Sub-Group to Parent (The Actor)
        const parent = groups.get(reg.id)
        if (parent) {
          const nested = parent.nestedGroups || []
          if (!nested.includes(rowId)) {
            groups.update({ id: reg.id, nestedGroups: [...nested, rowId] })
          }
        }

        // --- C. Create Time Blocks (The Items) ---
        entries.forEach((entry, i) => {
          // Dynamic Zoom: If data exists 5 years ago, expand the minDate
          minDate = min([minDate, entry.start])
          maxDate = max([maxDate, entry.end])

          const translatedValue = capital($_(entry.value))

          items.add({
            id: `${rowId}-${i}`,
            group: rowId, // Connects this block to the sub-row created above
            content: translatedValue,
            start: entry.start,
            end: entry.end,
            type: "range",
            className: "blue-item", // TODO: Not yet implemented, will be added later

            // Custom data payload for the tooltip (accessed in onMount template)
            tooltipData: {
              actor: reg.actor,
              attribute: translatedKey,
              value: translatedValue,
              start: entry.start,
              end: entry.end,
              note: reg.note,
            },
          } as TimelineItem)
        })
      })
    })

    return {
      items,
      groups,
      options: {
        stack: false, // Don't stack items on top of each other (we want 1 linear row)
        margin: { axis: 4, item: { horizontal: 0, vertical: 4 } },

        // Initial Viewport
        start: defaultZoomStart,
        end: defaultZoomEnd,

        // Hard Scroll Limits (Calculated + Buffer of 360 days)
        // Prevents user from scrolling into the year 3000
        min: subYears(minDate, 1),
        max: addYears(maxDate, 1),

        // Interaction Settings
        verticalScroll: true,
        horizontalScroll: true,
        // 'as const' is required here because Vis.js strictly types these strings
        horizontalScrollKey: "shiftKey" as const,
        horizontalScrollInvert: true,
        zoomKey: "ctrlKey" as const, // Requires CTRL+Scroll to zoom
      },
    }
  }

  // ==========================================
  // LIFECYCLE
  // ==========================================
  onMount(() => {
    // 1. Initialize Timeline
    // We start with empty datasets; we will update them after fetch.
    timeline = new Timeline(container, new DataSet(), new DataSet(), {
      orientation: "top",
      groupHeightMode: "fixed",
      // Tooltip HTML Generation
      tooltip: {
        followMouse: true,
        overflowMethod: "flip",
        template: (item: any) => {
          const d = item.tooltipData
          const endStr =
            d.end.getFullYear() > 2090 ? "Infinity" : format(d.end, "dd-MM-yyyy")

          return `
            <div class="timeline-tooltip">
              <div class="tooltip-header">${d.actor}</div>
              <div class="tooltip-attr">${d.attribute}</div>
              <div class="tooltip-new">${d.value}</div>
              <div class="tooltip-date">
                ${format(d.start, "dd-MM-yyyy")} &rarr; ${endStr}
              </div>
              ${d.note ? `<div class="tooltip-note">"${d.note}"</div>` : ""}
            </div>
          `
        },
      },
    })

    // 2. Data Fetching Pipeline
    const createTimeline = async () => {
      try {
        const rawData = await getAuditlog($page.params.uuid)

        // Step A: Logic Layer (Parse JSON -> Objects)
        const cleanData = transformAuditLog(rawData)

        // Step B: View Layer (Objects -> Vis.js Items)
        const { items, groups, options } = renderTimeline(cleanData)

        // Step C: Update UI
        timeline.setGroups(groups)
        timeline.setItems(items)
        timeline.setOptions(options)
      } finally {
        isLoading = false
      }
    }

    createTimeline()

    // Cleanup on destroy
    return () => timeline?.destroy()
  })
</script>

<div class="px-12 pt-6 relative min-h-[500px] overflow-y">
  <div
    class="visualization bg-slate-100 rounded-md p-4 overflow-y h-full"
    bind:this={container}
  />
  {#if isLoading}
    <div class="absolute inset-0 flex items-center justify-center">Loading...</div>
  {/if}
</div>
