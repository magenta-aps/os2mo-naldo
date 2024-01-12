<script lang="ts">
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { GetEngagementsDocument, type GetEngagementsQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import { onMount } from "svelte"

  type Engagements = GetEngagementsQuery["engagements"]["objects"][0]["current"][]
  let data: Engagements

  export let name: string, jobFunctionUuid: string, orgUnitUuid: string

  // As of now, the query is slow when it includes "query". My guess is that it's the nested filters in `job_function` that does this.
  // Both `null` and `""` makes it slow.

  gql`
    query GetEngagements(
      $limit: int = 10
      $queryString: String
      $orgUnit: [UUID!]
      $jobFunction: [UUID!]
      $fromDate: DateTime
    ) {
      engagements(
        limit: $limit
        filter: {
          employee: { query: $queryString }
          org_unit: { uuids: $orgUnit }
          job_function: { uuids: $jobFunction }
          from_date: $fromDate
        }
      ) {
        objects {
          current {
            person {
              name
            }
            primary {
              name
            }
            job_function {
              name
            }
            org_unit {
              name
              managers {
                person {
                  name
                }
              }
            }
            validity {
              from
              to
            }
          }
        }
      }
    }
  `

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  $: {
    filterEngagements(name, jobFunctionUuid, orgUnitUuid)
  }

  interface Header {
    key: string
    label: string
  }

  const allPossibleHeaders = [
    { key: "person.0.name", label: "Person Name" },
    { key: "primary.name", label: "Primary" },
    { key: "job_function.name", label: "Job Function Name" },
    { key: "org_unit.0.name", label: "Organization Unit Name" },
    { key: "org_unit.0.managers.0.person.0.name", label: "Manager Name" },
    { key: "validity.from", label: "Validity From" },
    { key: "validity.to", label: "Validity To" },
  ]

  interface FlattenedObject {
    [key: string]: any
  }

  // TODO: Allow multiple managers in CSV

  // Function to flatten nested objects
  const flattenObject = (obj: any, parentKey: string = ""): FlattenedObject => {
    return Object.keys(obj).reduce((acc: FlattenedObject, key: string) => {
      const newKey = parentKey ? `${parentKey}.${key}` : key

      if (typeof obj[key] === "object" && obj[key] !== null) {
        Object.assign(acc, flattenObject(obj[key], newKey))
      } else {
        acc[newKey] = obj[key]
      }

      return acc
    }, {})
  }

  // Function to extract unique fields from an array of objects
  const extractFields = (data: any[]): string[] => {
    const flattenedData: FlattenedObject[] = data.map((item) => flattenObject(item))

    const allFields: string[] = flattenedData.reduce(
      (acc: string[], item: FlattenedObject) => {
        Object.keys(item).forEach((key) => {
          if (!acc.includes(key)) {
            acc.push(key)
          }
        })
        return acc
      },
      []
    )

    return allFields
  }

  // Function to convert JSON data to CSV format
  const json2csv = (data: any[], headers: Header[]): string => {
    // Filter headers based on the presence of data
    const includedHeaders: Header[] = headers.filter((header) =>
      data.some((item) => {
        const value = header.key
          .split(".")
          .reduce(
            (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
            item
          )
        return value !== undefined
      })
    )

    // Generate CSV content
    const csvContent: string = [
      includedHeaders.map((header) => header.label).join(","),
      ...data.map((item) => {
        const rowValues: string[] = includedHeaders.map((header) => {
          const value = header.key
            .split(".")
            .reduce(
              (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
              item
            )
          return JSON.stringify(value)
        })
        return rowValues.join(",")
      }),
    ].join("\n")

    return csvContent
  }

  // Function to handle the download action
  const downloadHandler = (): void => {
    const currentDataHeaders: Header[] = allPossibleHeaders.map((definedHeader) => {
      // Check if definedHeader.key is present in the data
      const matchedHeader = extractFields(data).includes(definedHeader.key)
        ? definedHeader
        : null
      return matchedHeader || { key: definedHeader.key, label: definedHeader.key }
    })

    // Generate CSV and trigger download
    const csvData: string = json2csv(data, currentDataHeaders)
    const blob: Blob = new Blob([csvData], { type: "text/csv" })
    const link: HTMLAnchorElement = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "insights.csv"
    link.click()
  }

  async function filterEngagements(
    name: string | undefined | null,
    jobFunctionUuid: string | undefined | null,
    orgUnitUuid: string | undefined | null
  ) {
    const res = await graphQLClient().request(GetEngagementsDocument, {
      queryString: name,
      jobFunction: jobFunctionUuid,
      orgUnit: orgUnitUuid,
      fromDate: $date,
    })
    const engagements: Engagements = []

    // Filters and flattens the data
    for (const outer of res.engagements.objects) {
      engagements.push(outer.current)
    }
    data = engagements
  }

  onMount(async () => {
    await filterEngagements(name, jobFunctionUuid, orgUnitUuid)
  })
</script>

<button on:click={downloadHandler}>Download CSV</button>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">Henter data...</td>
  </tr>
{:else}
  {#each data as engagement, i}
    {#if engagement}
      <tr
        class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
      py-4 leading-5 border-t border-slate-300 text-secondary"
      >
        <td class="p-4">
          {engagement.person[0].name}
        </td>
        <td class="p-4">
          {engagement.job_function.name}
        </td>
        <td class="p-4">
          {engagement.org_unit[0].name}
        </td>
        <td class="p-4">
          {#if engagement.org_unit[0].managers.length}
            {#each engagement.org_unit[0].managers as manager}
              <p>
                {manager.person?.[0].name}
              </p>
            {/each}
          {/if}
        </td>
        <ValidityTableCell validity={engagement.validity} />
      </tr>
    {/if}
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <!-- TODO: Add translated "No <type> in <tense>"-message" -->
      <td class="p-4">Ingen medarbejder</td>
    </tr>
  {/each}
{/if}
