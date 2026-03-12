import { graphQLClient } from "$lib/http/client"

export const paginateQuery = async (
  query: string,
  variableValues: Record<string, any> = {},
  pageSize: number,
  onProgress: (count: number) => void = () => {},
  abortSignal?: AbortSignal,
  maxRetries: number = 30
): Promise<any[]> => {
  let nextCursor = null
  const results: any[] = []
  let requestCount = 0

  try {
    while (true) {
      if (abortSignal?.aborted) {
        break
      }

      requestCount++
      onProgress(requestCount)

      const variables = {
        ...variableValues,
        limit: pageSize,
        cursor: nextCursor,
      }

      for (let attempts = 0; attempts <= maxRetries; attempts++) {
        try {
          const result: any = await graphQLClient(abortSignal).request(query, variables)

          // Add results to the array
          for (const obj of result.page.objects) {
            results.push(obj)
          }
          nextCursor = result.page["page_info"]["next_cursor"]
          break
        } catch (error: any) {
          console.error("Error encountered during request:", error)
          const errorMessage = error?.response?.errors?.[0]?.message || error.message
          const isRetryable =
            error instanceof TypeError ||
            error.name === "TimeoutError" ||
            errorMessage?.toLowerCase().includes("signature has expired")

          if (isRetryable && attempts < maxRetries) {
            console.warn(
              `Retrying request (${attempts + 1}/${maxRetries}) due to: ${errorMessage}`
            )
            // Exponential backoff: 1s, 2s, 4s, ... capped at 30s
            const delay = Math.min(1000 * 2 ** attempts, 30000)
            await new Promise((resolve) => setTimeout(resolve, delay))
          } else {
            console.error("Failed after retries or non-retryable error:", error)
            throw error
          }
        }
      }

      if (!nextCursor) break // Exit if no more pages
    }
  } catch (error) {
    console.error("Error during pagination:", error)
    throw error
  }

  return results
}
