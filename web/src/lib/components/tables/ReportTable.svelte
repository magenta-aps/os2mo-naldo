<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { ReportsDocument, ReportFileDocument } from "./query.generated"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import Button from "$lib/components/shared/Button.svelte"
  import fileDownload from "@iconify/icons-material-symbols/file-download"

  gql`
    query Reports {
      files(filter: { file_store: EXPORTS }) {
        objects {
          file_name
        }
      }
    }
    query ReportFile($file_name: [String!]) {
      files(filter: { file_store: EXPORTS, file_names: $file_name }) {
        objects {
          file_name
          base64_contents
        }
      }
    }
  `

  const mimeTypes: Record<string, string> = {
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
  }

  const extension = (fileName: string) =>
    fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : ""

  const dataPromise = graphQLClient()
    .request(ReportsDocument)
    .then((res) =>
      res.files.objects.map(({ file_name }) => ({
        file_name,
        file_type: extension(file_name),
      }))
    )

  let downloading = new Set<string>()
  let failed = new Set<string>()

  const downloadFile = async (fileName: string) => {
    downloading = new Set(downloading).add(fileName)
    failed.delete(fileName)
    failed = failed
    try {
      const res = await graphQLClient().request(ReportFileDocument, {
        file_name: fileName,
      })
      const file = res.files.objects[0]
      const bytes = Uint8Array.from(atob(file.base64_contents), (c) => c.charCodeAt(0))
      const blob = new Blob([bytes], {
        type: mimeTypes[extension(file.file_name)] ?? "application/octet-stream",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.file_name
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      failed = new Set(failed).add(fileName)
    } finally {
      downloading.delete(fileName)
      downloading = downloading
    }
  }
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  {#each sortData(data, $sortKey, $sortDirection) as file, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'}
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4 break-all">
        {file.file_name}
        {#if failed.has(file.file_name)}
          <p class="text-error">{capital($_("load_error"))}</p>
        {/if}
      </td>
      <td class="text-sm p-4 uppercase">{file.file_type}</td>
      <td class="flex p-4 gap-2 justify-end">
        <Button
          type="button"
          title={capital($_("download"))}
          icon={fileDownload}
          width="18"
          height="18"
          outline
          disabled={downloading.has(file.file_name)}
          spinner={downloading.has(file.file_name)}
          on:click={() => downloadFile(file.file_name)}
        />
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("report", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{:catch}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("load_error"))}</td>
  </tr>
{/await}
