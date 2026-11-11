<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { ReportsDocument, ReportFileDocument } from "./query.generated"
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
    .then((res) => res.files.objects)

  const base64ToBytes = (base64: string) => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  }

  const saveFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    // Some browsers ignore clicks on detached links and read the URL after
    // `click()` returns, so the link must be in the page and the URL outlive it.
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 40_000)
  }

  const downloadFile = async (fileName: string) => {
    const res = await graphQLClient().request(ReportFileDocument, {
      file_name: fileName,
    })
    const file = res.files.objects[0]
    const mimeType = mimeTypes[extension(file.file_name)]
    if (!mimeType) {
      console.error(`Unsupported file type: ${file.file_name}`)
      return
    }
    const blob = new Blob([base64ToBytes(file.base64_contents)], { type: mimeType })
    saveFile(blob, file.file_name)
  }
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  {#each data as file, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'}
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4 break-all">{file.file_name}</td>
      <td class="flex p-4 gap-2 justify-end">
        <Button
          type="button"
          title={capital($_("download"))}
          icon={fileDownload}
          width="18"
          height="18"
          outline
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
