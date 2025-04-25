<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { GetFileNamesDocument, GetFileDocument } from "./query.generated"
  import Icon from "@iconify/svelte"
  import fileDownload from "@iconify/icons-material-symbols/file-download"
  import Button from "$lib/components/shared/Button.svelte"

  gql`
    query GetFileNames {
      files(filter: { file_store: EXPORTS }) {
        objects {
          file_name
        }
      }
    }
    query GetFile($file_name: [String!]) {
      files(filter: { file_store: EXPORTS, file_names: $file_name }) {
        objects {
          file_name
          base64_contents
        }
      }
    }
  `

  /**
   * Downloads a file from the server using GraphQL request, converts it from Base64 to a Blob object,
   * and initiates the download of the file in the browser.
   * @param {string} filename - The name of the file to download.
   */
  const downloadFile = async (filename: string) => {
    const res = await graphQLClient().request(GetFileDocument, { file_name: filename })

    const file = res.files.objects[0] as { base64_contents: string; file_name: string }

    // Extract the Base64 content of the file from the response
    const base64String = file.base64_contents

    // Decode the Base64 string to binary data
    const binaryString = atob(base64String)

    // Create a Uint8Array to store the binary data
    const bytes = new Uint8Array(binaryString.length)

    // Populate the Uint8Array with binary data
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Extract the file extension from the filename
    const fileExtension = file.file_name.split(".").pop()?.toLowerCase()

    // Determine the MIME type based on the file extension
    let mimeType
    if (fileExtension === "xlsx") {
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    } else if (fileExtension === "csv") {
      mimeType = "text/csv"
    } else {
      console.error("Unsupported file extension")
      return
    }

    // Create a Blob object from the binary data with the appropriate MIME type
    var blob = new Blob([bytes], { type: mimeType })

    // Create a URL for the Blob object
    const url = URL.createObjectURL(blob)

    // Create an <a> element to trigger the download
    const a = document.createElement("a")
    a.href = url
    a.download = res.files.objects[0].file_name // Set the download filename
    a.style.display = "none"

    // Append the <a> element to the document body
    document.body.appendChild(a)

    // Initiate the download by clicking the <a> element
    a.click()

    // Revoke the URL to free up resources
    window.URL.revokeObjectURL(url)

    // Remove the <a> element from the document body
    document.body.removeChild(a)
  }
</script>

<div class="px-12 pt-6">
  <h1 class="mb-4">{capital($_("report", { values: { n: 2 } }))}</h1>
  {#await graphQLClient().request(GetFileNamesDocument)}
    <p>{capital($_("loading"))}...</p>
  {:then data}
    {#each data.files.objects as file}
      <div>
        <Button
          title={file.file_name}
          type="button"
          onClick={() => {
            downloadFile(file.file_name)
          }}
          icon={fileDownload}
          width="20"
          height="20"
        />
      </div>
    {/each}
  {/await}
</div>
